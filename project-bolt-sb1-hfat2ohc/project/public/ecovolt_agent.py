#!/usr/bin/env python3
"""EcoVolt customer telemetry agent. Sends measured host metrics; unsupported sensors stay null."""
import getpass
import json
import os
import platform
import socket
import subprocess
import time
import urllib.error
import urllib.request

import psutil

ECOVOLT_ENDPOINT = os.environ.get("ECOVOLT_ENDPOINT", "https://ecovoltofficial.in/api/telemetry")
INTERVAL_SECONDS = max(5, int(os.environ.get("ECOVOLT_INTERVAL_SECONDS", "5")))


def run_powershell(command):
    if platform.system() != "Windows":
        return None
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", command],
            capture_output=True, text=True, timeout=8, check=False
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        pass
    return None


def discover_hardware():
    cpu = platform.processor() or platform.machine()
    gpu = run_powershell(
        "Get-CimInstance Win32_VideoController | "
        "Select-Object -First 1 -ExpandProperty Name"
    )
    return {
        "node_id": os.environ.get("ECOVOLT_NODE_ID") or input("EcoVolt Node ID: ").strip() or socket.gethostname(),
        "hardware_type": ", ".join(part for part in [cpu, gpu, f"{round(psutil.virtual_memory().total / (1024 ** 3), 1)} GB RAM"] if part),
        "os": platform.platform(),
        "cpu_cores": psutil.cpu_count(logical=False),
        "cpu_threads": psutil.cpu_count(logical=True),
    }


def read_gpu_engine_peak():
    raw = run_powershell(
        "Get-CimInstance Win32_PerfFormattedData_GPUPerformanceCounters_GPUEngine "
        "| Measure-Object -Property UtilizationPercentage -Maximum "
        "| Select-Object -ExpandProperty Maximum"
    )
    try:
        return round(float(raw), 2) if raw is not None else None
    except ValueError:
        return None


def read_gpu_adapter_memory():
    raw = run_powershell(
        "Get-CimInstance Win32_PerfFormattedData_GPUPerformanceCounters_GPUAdapterMemory "
        "| Select-Object Name,DedicatedUsage,SharedUsage,TotalCommitted "
        "| ConvertTo-Json -Compress"
    )
    if not raw:
        return None
    try:
        data = json.loads(raw)
        rows = data if isinstance(data, list) else [data]
        for row in rows:
            for key in ("DedicatedUsage", "SharedUsage", "TotalCommitted"):
                value = row.get(key)
                if isinstance(value, (int, float)):
                    row[key + "_MiB"] = round(value / (1024 ** 2), 2)
        return rows
    except (ValueError, TypeError):
        return None


def read_metrics():
    return {
        "cpu_utilization_percent": psutil.cpu_percent(interval=1),
        "ram_utilization_percent": psutil.virtual_memory().percent,
        "gpu_engine_peak_utilization_percent": read_gpu_engine_peak(),
        "gpu_adapter_memory": read_gpu_adapter_memory(),
        "gpu_temperature_celsius": None,
        "gpu_utilization_percent": None,
        "vram_utilization_percent": None,
        "gpu_power_draw_watts": None,
        "sensor_note": "GPU temperature, total utilization, VRAM percentage and power are null unless a supported vendor sensor is added."
    }


def send_packet(token, hardware):
    payload = {
        "node_id": hardware["node_id"],
        "hardware_type": hardware["hardware_type"],
        "facility_type": "compute_node",
        "metrics": read_metrics()
    }
    request = urllib.request.Request(
        ECOVOLT_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))
            print("[EcoVolt] HTTP", response.status, "|", result.get("node_id"), "|", result.get("last_updated"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        print("[EcoVolt] HTTP", error.code, "|", detail)
        if error.code in (401, 403):
            raise SystemExit("Agent credential rejected. Generate a new token in the EcoVolt Script Hub.")
    except (urllib.error.URLError, TimeoutError) as error:
        print("[EcoVolt] Network error:", error)


def main():
    print("=== EcoVolt Customer Telemetry Agent ===")
    token = os.environ.get("ECOVOLT_AGENT_TOKEN") or getpass.getpass("Paste your one-time EcoVolt agent token: ").strip()
    if not token:
        raise SystemExit("Missing agent token.")
    hardware = discover_hardware()
    if not hardware["node_id"]:
        raise SystemExit("Node ID is required.")
    print("Node:", hardware["node_id"])
    print("Hardware:", hardware["hardware_type"])
    print("Endpoint:", ECOVOLT_ENDPOINT)
    print("Monitoring only. This agent does not control hardware.")
    while True:
        try:
            send_packet(token, hardware)
        except KeyboardInterrupt:
            print("\nEcoVolt agent stopped.")
            break
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()

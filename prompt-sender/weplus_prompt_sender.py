"""
WePlus Prompt Sender
Local Windows desktop helper for supervised prompt sending.

Main jobs:
1) Import CSV/Excel from Product Review Prompt Studio.
2) Paste reference images/files first.
3) Paste prompt text.
4) Press Enter.
5) Wait between jobs.
6) Remember click/timing behavior as platform profiles.

This app runs locally on the user's computer. It is not deployed.
"""
from __future__ import annotations

import csv
import json
import os
import queue
import struct
import threading
import time
import tkinter as tk
from dataclasses import dataclass, field
from pathlib import Path
from tkinter import filedialog, messagebox, simpledialog, ttk
from typing import Iterable

APP_TITLE = "WePlus Prompt Sender"
APP_DIR = Path(__file__).resolve().parent
PROFILE_PATH = APP_DIR / "sender_profiles.json"
LOG_PATH = APP_DIR / "sender-debug.log"
FIELDNAMES = ["profile", "job_type", "shot_id", "prompt", "attachments", "delay_sec", "status", "output_name"]
CF_HDROP = 15
CF_UNICODETEXT = 13
GMEM_MOVEABLE = 0x0002

try:
    import pyautogui  # type: ignore
    pyautogui.PAUSE = 0.18
except Exception:
    pyautogui = None


def enable_dpi_awareness() -> None:
    if os.name != "nt":
        return
    try:
        import ctypes
        try:
            ctypes.windll.shcore.SetProcessDpiAwareness(2)
        except Exception:
            ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass


enable_dpi_awareness()


DEFAULT_PROFILES = {
    "GPT Image": {
        "target_x": -1,
        "target_y": -1,
        "delay_sec": 150,
        "upload_wait_sec": 20,
        "file_gap_sec": 8,
        "countdown_sec": 5,
        "minimize_on_start": True,
        "manual_focus": True,
        "click_before_each_step": True,
        "prompt_prefix": "",
    },
    "FLOW": {
        "target_x": -1,
        "target_y": -1,
        "delay_sec": 420,
        "upload_wait_sec": 40,
        "file_gap_sec": 8,
        "countdown_sec": 5,
        "minimize_on_start": True,
        "manual_focus": True,
        "click_before_each_step": True,
        "prompt_prefix": "",
    },
    "Grok": {
        "target_x": -1,
        "target_y": -1,
        "delay_sec": 360,
        "upload_wait_sec": 35,
        "file_gap_sec": 8,
        "countdown_sec": 5,
        "minimize_on_start": True,
        "manual_focus": True,
        "click_before_each_step": True,
        "prompt_prefix": "",
    },
    "Custom": {
        "target_x": -1,
        "target_y": -1,
        "delay_sec": 180,
        "upload_wait_sec": 25,
        "file_gap_sec": 8,
        "countdown_sec": 5,
        "minimize_on_start": True,
        "manual_focus": True,
        "click_before_each_step": True,
        "prompt_prefix": "",
    },
}


@dataclass
class ShotItem:
    shot_id: str
    prompt: str
    attachments: list[str] = field(default_factory=list)
    delay_sec: int = 150
    status: str = "pending"
    profile: str = ""
    job_type: str = ""
    output_name: str = ""


def split_paths(value: object) -> list[str]:
    return [p.strip().strip('"') for p in str(value or "").split("|") if p.strip()]


def row_to_item(row: dict[str, object], default_delay: int, active_profile: str = "") -> ShotItem:
    delay_raw = str(row.get("delay_sec") or row.get("delay") or default_delay).strip()
    try:
        delay_sec = max(1, int(float(delay_raw)))
    except ValueError:
        delay_sec = default_delay
    return ShotItem(
        profile=str(row.get("profile") or active_profile or "").strip(),
        job_type=str(row.get("job_type") or row.get("type") or "").strip(),
        shot_id=str(row.get("shot_id") or row.get("shot") or "").strip(),
        prompt=str(row.get("prompt") or "").strip(),
        attachments=split_paths(row.get("attachments") or row.get("attachment")),
        delay_sec=delay_sec,
        status=str(row.get("status") or "pending").strip() or "pending",
        output_name=str(row.get("output_name") or "").strip(),
    )


def item_to_row(item: ShotItem) -> dict[str, object]:
    return {
        "profile": item.profile,
        "job_type": item.job_type,
        "shot_id": item.shot_id,
        "prompt": item.prompt,
        "attachments": "|".join(item.attachments),
        "delay_sec": item.delay_sec,
        "status": item.status,
        "output_name": item.output_name,
    }


def load_items_from_file(path: str, default_delay: int, active_profile: str = "") -> list[ShotItem]:
    suffix = Path(path).suffix.lower()
    if suffix in {".xlsx", ".xlsm"}:
        try:
            from openpyxl import load_workbook  # type: ignore
        except ImportError as exc:
            raise RuntimeError("Excel import needs openpyxl. Run install.bat first.") from exc
        workbook = load_workbook(path, read_only=True, data_only=True)
        sheet = workbook.active
        rows = list(sheet.iter_rows(values_only=True))
        workbook.close()
        if not rows:
            return []
        headers = [str(value or "").strip() for value in rows[0]]
        items: list[ShotItem] = []
        for values in rows[1:]:
            row = {headers[idx]: value for idx, value in enumerate(values) if idx < len(headers)}
            item = row_to_item(row, default_delay, active_profile)
            if item.shot_id or item.prompt:
                items.append(item)
        return items
    with open(path, newline="", encoding="utf-8-sig") as handle:
        return [row_to_item(row, default_delay, active_profile) for row in csv.DictReader(handle) if row]


def save_items_to_file(path: str, items: list[ShotItem]) -> None:
    suffix = Path(path).suffix.lower()
    rows = [item_to_row(item) for item in items]
    if suffix in {".xlsx", ".xlsm"}:
        try:
            from openpyxl import Workbook  # type: ignore
        except ImportError as exc:
            raise RuntimeError("Excel export needs openpyxl. Run install.bat first.") from exc
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Prompt Queue"
        sheet.append(FIELDNAMES)
        for row in rows:
            sheet.append([row.get(name, "") for name in FIELDNAMES])
        sheet.column_dimensions["D"].width = 82
        sheet.column_dimensions["E"].width = 52
        workbook.save(path)
        workbook.close()
        return
    with open(path, "w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def retry(label: str, func, attempts: int = 3, delay: float = 0.35):
    last: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return func()
        except Exception as exc:
            last = exc
            if attempt == attempts:
                break
            time.sleep(delay * attempt)
    raise RuntimeError(f"{label} failed: {last}") from last


def set_text_clipboard_windows(text: str) -> None:
    if os.name != "nt":
        raise RuntimeError("Text clipboard native mode is Windows-only.")
    import ctypes
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    kernel32.GlobalAlloc.argtypes = [ctypes.c_uint, ctypes.c_size_t]
    kernel32.GlobalAlloc.restype = ctypes.c_void_p
    kernel32.GlobalLock.argtypes = [ctypes.c_void_p]
    kernel32.GlobalLock.restype = ctypes.c_void_p
    kernel32.GlobalUnlock.argtypes = [ctypes.c_void_p]
    kernel32.GlobalUnlock.restype = ctypes.c_bool
    kernel32.GlobalFree.argtypes = [ctypes.c_void_p]
    kernel32.GlobalFree.restype = ctypes.c_void_p
    user32.OpenClipboard.argtypes = [ctypes.c_void_p]
    user32.OpenClipboard.restype = ctypes.c_bool
    user32.EmptyClipboard.argtypes = []
    user32.EmptyClipboard.restype = ctypes.c_bool
    user32.SetClipboardData.argtypes = [ctypes.c_uint, ctypes.c_void_p]
    user32.SetClipboardData.restype = ctypes.c_void_p
    user32.CloseClipboard.argtypes = []
    user32.CloseClipboard.restype = ctypes.c_bool

    payload = (text + "\0").encode("utf-16le")
    handle = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(payload))
    if not handle:
        raise OSError("GlobalAlloc failed for text")
    locked = kernel32.GlobalLock(handle)
    if not locked:
        kernel32.GlobalFree(handle)
        raise OSError("GlobalLock failed for text")
    try:
        ctypes.memmove(locked, payload, len(payload))
    finally:
        kernel32.GlobalUnlock(handle)
    if not user32.OpenClipboard(None):
        kernel32.GlobalFree(handle)
        raise OSError("OpenClipboard failed for text")
    try:
        user32.EmptyClipboard()
        if not user32.SetClipboardData(CF_UNICODETEXT, handle):
            kernel32.GlobalFree(handle)
            raise OSError("SetClipboardData failed for text")
        handle = None
    finally:
        user32.CloseClipboard()


def set_file_clipboard_windows(paths: Iterable[str]) -> None:
    if os.name != "nt":
        raise RuntimeError("File clipboard mode is Windows-only.")
    import ctypes
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    kernel32.GlobalAlloc.argtypes = [ctypes.c_uint, ctypes.c_size_t]
    kernel32.GlobalAlloc.restype = ctypes.c_void_p
    kernel32.GlobalLock.argtypes = [ctypes.c_void_p]
    kernel32.GlobalLock.restype = ctypes.c_void_p
    kernel32.GlobalUnlock.argtypes = [ctypes.c_void_p]
    kernel32.GlobalUnlock.restype = ctypes.c_bool
    kernel32.GlobalFree.argtypes = [ctypes.c_void_p]
    kernel32.GlobalFree.restype = ctypes.c_void_p
    user32.OpenClipboard.argtypes = [ctypes.c_void_p]
    user32.OpenClipboard.restype = ctypes.c_bool
    user32.EmptyClipboard.argtypes = []
    user32.EmptyClipboard.restype = ctypes.c_bool
    user32.SetClipboardData.argtypes = [ctypes.c_uint, ctypes.c_void_p]
    user32.SetClipboardData.restype = ctypes.c_void_p
    user32.CloseClipboard.argtypes = []
    user32.CloseClipboard.restype = ctypes.c_bool

    absolute = [str(Path(p).resolve()) for p in paths if p]
    missing = [p for p in absolute if not Path(p).exists()]
    if missing:
        raise FileNotFoundError("Missing attachment: " + missing[0])
    if not absolute:
        return
    encoded = ("\0".join(absolute) + "\0\0").encode("utf-16le")
    payload = struct.pack("IiiII", 20, 0, 0, 0, 1) + encoded
    handle = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(payload))
    if not handle:
        raise OSError("GlobalAlloc failed for files")
    locked = kernel32.GlobalLock(handle)
    if not locked:
        kernel32.GlobalFree(handle)
        raise OSError("GlobalLock failed for files")
    try:
        ctypes.memmove(locked, payload, len(payload))
    finally:
        kernel32.GlobalUnlock(handle)
    if not user32.OpenClipboard(None):
        kernel32.GlobalFree(handle)
        raise OSError("OpenClipboard failed for files")
    try:
        user32.EmptyClipboard()
        if not user32.SetClipboardData(CF_HDROP, handle):
            kernel32.GlobalFree(handle)
            raise OSError("SetClipboardData failed for files")
        handle = None
    finally:
        user32.CloseClipboard()


def send_ctrl_v() -> None:
    if pyautogui is None:
        raise RuntimeError("pyautogui is not installed.")
    if os.name != "nt":
        pyautogui.hotkey("ctrl", "v")
        return
    import ctypes
    user32 = ctypes.windll.user32
    keybd_event = user32.keybd_event
    keybd_event.argtypes = [ctypes.c_ubyte, ctypes.c_ubyte, ctypes.c_uint, ctypes.c_void_p]
    keybd_event.restype = None
    vk_control = 0x11
    vk_v = 0x56
    key_up = 0x0002
    keybd_event(vk_control, 0, 0, None)
    time.sleep(0.04)
    keybd_event(vk_v, 0, 0, None)
    time.sleep(0.04)
    keybd_event(vk_v, 0, key_up, None)
    time.sleep(0.04)
    keybd_event(vk_control, 0, key_up, None)


def send_enter() -> None:
    if pyautogui is None:
        raise RuntimeError("pyautogui is not installed.")
    if os.name != "nt":
        pyautogui.press("enter")
        return
    import ctypes
    user32 = ctypes.windll.user32
    keybd_event = user32.keybd_event
    keybd_event.argtypes = [ctypes.c_ubyte, ctypes.c_ubyte, ctypes.c_uint, ctypes.c_void_p]
    keybd_event.restype = None
    vk_return = 0x0D
    key_up = 0x0002
    keybd_event(vk_return, 0, 0, None)
    time.sleep(0.05)
    keybd_event(vk_return, 0, key_up, None)


def native_click(x: int, y: int) -> None:
    if pyautogui is None:
        raise RuntimeError("pyautogui is not installed.")
    if os.name != "nt":
        pyautogui.click(x, y)
        return
    import ctypes
    user32 = ctypes.windll.user32
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.18)
    user32.mouse_event(0x0002, 0, 0, 0, None)
    time.sleep(0.05)
    user32.mouse_event(0x0004, 0, 0, 0, None)


class PromptSenderApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("920x720")
        self.minsize(820, 620)
        self.configure(bg="#0b1017")
        self.items: list[ShotItem] = []
        self.queue_path: str | None = None
        self.profiles = self.load_profiles()
        self.ui_queue: queue.Queue[tuple[str, object]] = queue.Queue()
        self.stop_event = threading.Event()
        self.worker: threading.Thread | None = None
        self.busy = False

        self.profile_var = tk.StringVar(value=self.load_last_profile())
        self.target_x_var = tk.IntVar(value=-1)
        self.target_y_var = tk.IntVar(value=-1)
        self.delay_var = tk.IntVar(value=150)
        self.upload_var = tk.IntVar(value=20)
        self.file_gap_var = tk.IntVar(value=8)
        self.countdown_var = tk.IntVar(value=5)
        self.minimize_var = tk.BooleanVar(value=True)
        self.manual_focus_var = tk.BooleanVar(value=True)
        self.click_each_var = tk.BooleanVar(value=True)
        self.skip_sent_var = tk.BooleanVar(value=True)
        self.autosave_var = tk.BooleanVar(value=True)
        self.status_var = tk.StringVar(value="Ready. Choose profile, import CSV, set point, then Start.")

        self.configure_style()
        self.build_ui()
        self.apply_profile_to_ui(self.profile_var.get())
        self.after(200, self.drain_ui_queue)

    def configure_style(self) -> None:
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background="#0b1017", foreground="#d7e3f2", fieldbackground="#111827")
        style.configure("Panel.TFrame", background="#0b1017")
        style.configure("Card.TFrame", background="#111827")
        style.configure("Title.TLabel", background="#0b1017", foreground="#f8fafc", font=("Segoe UI", 16, "bold"))
        style.configure("Subtle.TLabel", background="#0b1017", foreground="#91a4bd", font=("Segoe UI", 9))
        style.configure("CardLabel.TLabel", background="#111827", foreground="#93c5fd", font=("Segoe UI", 8, "bold"))
        style.configure("TButton", background="#1f2937", foreground="#e5edf8", borderwidth=0, padding=(10, 7))
        style.configure("Accent.TButton", background="#2dd4bf", foreground="#04111a", font=("Segoe UI", 9, "bold"), padding=(10, 9))
        style.configure("Danger.TButton", background="#7f1d1d", foreground="#fee2e2", padding=(10, 9))
        style.configure("Treeview", background="#0f1724", foreground="#e5edf8", fieldbackground="#0f1724", rowheight=28)
        style.configure("Treeview.Heading", background="#162033", foreground="#93c5fd", font=("Segoe UI", 8, "bold"))
        style.map("Treeview", background=[("selected", "#0f766e")], foreground=[("selected", "#ffffff")])
        style.configure("TCheckbutton", background="#111827", foreground="#cbd5e1")

    def build_ui(self) -> None:
        root = ttk.Frame(self, style="Panel.TFrame", padding=12)
        root.pack(fill="both", expand=True)
        header = ttk.Frame(root, style="Panel.TFrame")
        header.pack(fill="x", pady=(0, 10))
        ttk.Label(header, text="WePlus Prompt Sender", style="Title.TLabel").pack(anchor="w")
        ttk.Label(header, text="Local helper: paste refs + prompt + Enter into GPT / FLOW / Grok / image-to-video platforms", style="Subtle.TLabel").pack(anchor="w")

        top = ttk.Frame(root, style="Panel.TFrame")
        top.pack(fill="x", pady=(0, 10))
        top.columnconfigure(0, weight=1)
        top.columnconfigure(1, weight=1)

        profile_card = ttk.Frame(top, style="Card.TFrame", padding=10)
        profile_card.grid(row=0, column=0, sticky="nsew", padx=(0, 6))
        ttk.Label(profile_card, text="PROFILE / CLICK BEHAVIOR", style="CardLabel.TLabel").grid(row=0, column=0, columnspan=4, sticky="w")
        self.profile_combo = ttk.Combobox(profile_card, textvariable=self.profile_var, values=sorted(self.profiles.keys()), state="readonly")
        self.profile_combo.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(8, 6))
        self.profile_combo.bind("<<ComboboxSelected>>", lambda _e: self.apply_profile_to_ui(self.profile_var.get()))
        ttk.Button(profile_card, text="Save Profile", command=self.save_current_profile).grid(row=1, column=2, sticky="ew", padx=(6, 0), pady=(8, 6))
        ttk.Button(profile_card, text="New Profile", command=self.new_profile).grid(row=1, column=3, sticky="ew", padx=(6, 0), pady=(8, 6))
        ttk.Label(profile_card, text="Target X", style="CardLabel.TLabel").grid(row=2, column=0, sticky="w")
        ttk.Entry(profile_card, textvariable=self.target_x_var, width=8).grid(row=2, column=1, sticky="ew")
        ttk.Label(profile_card, text="Target Y", style="CardLabel.TLabel").grid(row=2, column=2, sticky="w", padx=(10,0))
        ttk.Entry(profile_card, textvariable=self.target_y_var, width=8).grid(row=2, column=3, sticky="ew")
        ttk.Button(profile_card, text="Set Point", command=self.set_point).grid(row=3, column=0, columnspan=2, sticky="ew", pady=(8, 0))
        ttk.Button(profile_card, text="Test Click", command=self.test_click).grid(row=3, column=2, columnspan=2, sticky="ew", padx=(6, 0), pady=(8, 0))
        for c in range(4):
            profile_card.columnconfigure(c, weight=1)

        timing_card = ttk.Frame(top, style="Card.TFrame", padding=10)
        timing_card.grid(row=0, column=1, sticky="nsew", padx=(6, 0))
        ttk.Label(timing_card, text="TIMING", style="CardLabel.TLabel").grid(row=0, column=0, columnspan=4, sticky="w")
        self.spin(timing_card, 1, 0, "Delay", self.delay_var, 1, 1800)
        self.spin(timing_card, 1, 2, "Upload", self.upload_var, 1, 300)
        self.spin(timing_card, 2, 0, "File gap", self.file_gap_var, 1, 120)
        self.spin(timing_card, 2, 2, "Countdown", self.countdown_var, 1, 60)
        ttk.Checkbutton(timing_card, text="Minimize on start/countdown", variable=self.minimize_var).grid(row=3, column=0, columnspan=2, sticky="w", pady=(8,0))
        ttk.Checkbutton(timing_card, text="Manual focus countdown", variable=self.manual_focus_var).grid(row=3, column=2, columnspan=2, sticky="w", pady=(8,0))
        ttk.Checkbutton(timing_card, text="Click before each paste", variable=self.click_each_var).grid(row=4, column=0, columnspan=2, sticky="w")
        ttk.Checkbutton(timing_card, text="Skip sent rows", variable=self.skip_sent_var).grid(row=4, column=2, columnspan=2, sticky="w")
        ttk.Checkbutton(timing_card, text="Autosave status", variable=self.autosave_var).grid(row=5, column=0, columnspan=2, sticky="w")
        ttk.Button(timing_card, text="Test Paste Prompt", command=self.test_paste_prompt).grid(row=5, column=2, columnspan=2, sticky="ew", padx=(6,0))
        for c in range(4):
            timing_card.columnconfigure(c, weight=1)

        action = ttk.Frame(root, style="Panel.TFrame")
        action.pack(fill="x", pady=(0, 10))
        ttk.Button(action, text="Import CSV/Excel", command=self.import_queue).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Export Queue", command=self.export_queue).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Add", command=self.add_item).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Edit", command=self.edit_item).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Remove", command=self.remove_item).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Send Selected", command=self.send_selected).pack(side="left", padx=(0, 6))
        ttk.Button(action, text="Start", style="Accent.TButton", command=self.start).pack(side="right", padx=(6, 0))
        ttk.Button(action, text="Stop", style="Danger.TButton", command=self.stop).pack(side="right")

        table_card = ttk.Frame(root, style="Card.TFrame", padding=10)
        table_card.pack(fill="both", expand=True, pady=(0, 8))
        columns = ("profile", "job_type", "shot_id", "prompt", "attachments", "delay", "status", "output")
        self.tree = ttk.Treeview(table_card, columns=columns, show="headings", selectmode="browse")
        headings = {"profile":"Profile", "job_type":"Type", "shot_id":"Shot", "prompt":"Prompt", "attachments":"Refs", "delay":"Sec", "status":"Status", "output":"Output"}
        widths = {"profile":85, "job_type":75, "shot_id":120, "prompt":330, "attachments":45, "delay":50, "status":80, "output":120}
        for c in columns:
            self.tree.heading(c, text=headings[c])
            self.tree.column(c, width=widths[c], anchor="w" if c not in {"attachments", "delay"} else "center")
        self.tree.pack(side="left", fill="both", expand=True)
        scroll = ttk.Scrollbar(table_card, orient="vertical", command=self.tree.yview)
        scroll.pack(side="right", fill="y")
        self.tree.configure(yscrollcommand=scroll.set)
        ttk.Label(root, textvariable=self.status_var, style="Subtle.TLabel", wraplength=880).pack(anchor="w", fill="x")

    def spin(self, parent, row, col, label, var, min_v, max_v) -> None:
        ttk.Label(parent, text=label, style="CardLabel.TLabel").grid(row=row, column=col, sticky="w", pady=(8, 0))
        ttk.Spinbox(parent, from_=min_v, to=max_v, textvariable=var, width=8).grid(row=row, column=col+1, sticky="ew", padx=(5, 0), pady=(8, 0))

    def load_profiles(self) -> dict:
        if PROFILE_PATH.exists():
            try:
                data = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
                profiles = dict(DEFAULT_PROFILES)
                profiles.update(data.get("profiles", {}))
                return profiles
            except Exception:
                pass
        return dict(DEFAULT_PROFILES)

    def load_last_profile(self) -> str:
        if PROFILE_PATH.exists():
            try:
                data = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
                last = data.get("last_profile")
                if last in self.profiles:
                    return last
            except Exception:
                pass
        return "GPT Image"

    def persist_profiles(self) -> None:
        data = {"last_profile": self.profile_var.get(), "profiles": self.profiles}
        PROFILE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def current_profile_data(self) -> dict:
        return {
            "target_x": int(self.target_x_var.get()),
            "target_y": int(self.target_y_var.get()),
            "delay_sec": int(self.delay_var.get()),
            "upload_wait_sec": int(self.upload_var.get()),
            "file_gap_sec": int(self.file_gap_var.get()),
            "countdown_sec": int(self.countdown_var.get()),
            "minimize_on_start": bool(self.minimize_var.get()),
            "manual_focus": bool(self.manual_focus_var.get()),
            "click_before_each_step": bool(self.click_each_var.get()),
            "prompt_prefix": "",
        }

    def apply_profile_to_ui(self, name: str) -> None:
        data = self.profiles.get(name) or DEFAULT_PROFILES["Custom"]
        self.target_x_var.set(int(data.get("target_x", -1)))
        self.target_y_var.set(int(data.get("target_y", -1)))
        self.delay_var.set(int(data.get("delay_sec", 150)))
        self.upload_var.set(int(data.get("upload_wait_sec", 20)))
        self.file_gap_var.set(int(data.get("file_gap_sec", 8)))
        self.countdown_var.set(int(data.get("countdown_sec", 5)))
        self.minimize_var.set(bool(data.get("minimize_on_start", True)))
        self.manual_focus_var.set(bool(data.get("manual_focus", True)))
        self.click_each_var.set(bool(data.get("click_before_each_step", True)))
        self.persist_profiles()
        self.status_var.set(f"Loaded profile: {name}")

    def save_current_profile(self) -> None:
        name = self.profile_var.get().strip() or "Custom"
        self.profiles[name] = self.current_profile_data()
        self.profile_combo.configure(values=sorted(self.profiles.keys()))
        self.persist_profiles()
        self.status_var.set(f"Saved profile: {name}")

    def new_profile(self) -> None:
        name = simpledialog.askstring(APP_TITLE, "New profile name:")
        if not name:
            return
        self.profiles[name] = self.current_profile_data()
        self.profile_var.set(name)
        self.profile_combo.configure(values=sorted(self.profiles.keys()))
        self.persist_profiles()
        self.status_var.set(f"Created profile: {name}")

    def log(self, msg: str) -> None:
        stamp = time.strftime("%Y-%m-%d %H:%M:%S")
        try:
            LOG_PATH.open("a", encoding="utf-8").write(f"[{stamp}] {msg}\n")
        except OSError:
            pass
        self.status_var.set(msg)

    def set_point(self) -> None:
        if pyautogui is None:
            messagebox.showerror(APP_TITLE, "pyautogui is not installed. Run install.bat first.")
            return
        if self.minimize_var.get():
            self.iconify()
        countdown = max(1, int(self.countdown_var.get()))
        for remaining in range(countdown, 0, -1):
            self.status_var.set(f"Move mouse to composer. Capturing in {remaining}s...")
            self.update_idletasks()
            time.sleep(1)
        pos = pyautogui.position()
        self.target_x_var.set(int(pos.x))
        self.target_y_var.set(int(pos.y))
        self.deiconify()
        self.save_current_profile()
        self.log(f"Target set for {self.profile_var.get()}: {pos.x}, {pos.y}")

    def click_target(self) -> bool:
        x, y = int(self.target_x_var.get()), int(self.target_y_var.get())
        if x < 0 or y < 0:
            return False
        native_click(x, y)
        return True

    def test_click(self) -> None:
        try:
            clicked = self.click_target()
            self.log(f"Test click result: {clicked}")
        except Exception as exc:
            self.log(f"Test click failed: {exc}")

    def focus_countdown(self, label: str) -> None:
        if self.manual_focus_var.get():
            if self.minimize_var.get():
                self.iconify()
            for remaining in range(max(1, int(self.countdown_var.get())), 0, -1):
                self.ui_queue.put(("status", f"Click composer for {label}: {remaining}s"))
                time.sleep(1)

    def test_paste_prompt(self) -> None:
        try:
            self.focus_countdown("TEST")
            if self.click_each_var.get():
                self.click_target()
            set_text_clipboard_windows("TEST PROMPT from WePlus Prompt Sender")
            time.sleep(0.2)
            send_ctrl_v()
            self.deiconify()
            self.log("Test prompt pasted.")
        except Exception as exc:
            self.deiconify()
            self.log(f"Test prompt failed: {exc}")

    def refresh_table(self) -> None:
        self.tree.delete(*self.tree.get_children())
        for idx, item in enumerate(self.items):
            prompt = item.prompt.replace("\n", " ")
            if len(prompt) > 70:
                prompt = prompt[:67] + "..."
            self.tree.insert("", "end", iid=str(idx), values=(
                item.profile or self.profile_var.get(), item.job_type, item.shot_id, prompt,
                len(item.attachments) if item.attachments else "-", item.delay_sec, item.status, item.output_name
            ))

    def import_queue(self) -> None:
        path = filedialog.askopenfilename(filetypes=[("CSV / Excel", "*.csv *.xlsx *.xlsm"), ("All files", "*.*")])
        if not path:
            return
        try:
            self.items = load_items_from_file(path, self.delay_var.get(), self.profile_var.get())
            self.queue_path = path
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        self.refresh_table()
        self.status_var.set(f"Imported {len(self.items)} rows: {path}")

    def export_queue(self) -> None:
        path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV", "*.csv"), ("Excel", "*.xlsx"), ("All files", "*.*")])
        if not path:
            return
        try:
            save_items_to_file(path, self.items)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        self.queue_path = path
        self.status_var.set(f"Saved queue: {path}")

    def autosave_queue(self) -> None:
        if self.autosave_var.get() and self.queue_path:
            try:
                save_items_to_file(self.queue_path, self.items)
            except Exception as exc:
                self.ui_queue.put(("status", f"Autosave failed: {exc}"))

    def selected_index(self) -> int | None:
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo(APP_TITLE, "Select a row first.")
            return None
        return int(selected[0])

    def add_item(self) -> None:
        item = self.item_dialog()
        if item:
            self.items.append(item)
            self.refresh_table()

    def edit_item(self) -> None:
        idx = self.selected_index()
        if idx is None: return
        item = self.item_dialog(self.items[idx])
        if item:
            self.items[idx] = item
            self.refresh_table()

    def remove_item(self) -> None:
        idx = self.selected_index()
        if idx is None: return
        self.items.pop(idx)
        self.refresh_table()

    def item_dialog(self, existing: ShotItem | None = None) -> ShotItem | None:
        dialog = tk.Toplevel(self)
        dialog.title("Queue Item")
        dialog.geometry("760x560")
        dialog.transient(self)
        dialog.grab_set()
        result = {"item": None}
        profile_var = tk.StringVar(value=(existing.profile if existing else self.profile_var.get()))
        type_var = tk.StringVar(value=(existing.job_type if existing else "first_frame"))
        shot_var = tk.StringVar(value=(existing.shot_id if existing else ""))
        delay_var = tk.IntVar(value=(existing.delay_sec if existing else self.delay_var.get()))
        output_var = tk.StringVar(value=(existing.output_name if existing else ""))
        attachments = list(existing.attachments if existing else [])
        frame = ttk.Frame(dialog, padding=12)
        frame.pack(fill="both", expand=True)
        frame.columnconfigure(1, weight=1)
        ttk.Label(frame, text="Profile").grid(row=0, column=0, sticky="w")
        ttk.Entry(frame, textvariable=profile_var).grid(row=0, column=1, sticky="ew", padx=8)
        ttk.Label(frame, text="Type").grid(row=0, column=2, sticky="w")
        ttk.Entry(frame, textvariable=type_var, width=14).grid(row=0, column=3, sticky="ew")
        ttk.Label(frame, text="Shot ID").grid(row=1, column=0, sticky="w", pady=(8,0))
        ttk.Entry(frame, textvariable=shot_var).grid(row=1, column=1, sticky="ew", padx=8, pady=(8,0))
        ttk.Label(frame, text="Delay").grid(row=1, column=2, sticky="w", pady=(8,0))
        ttk.Spinbox(frame, from_=1, to=1800, textvariable=delay_var, width=8).grid(row=1, column=3, sticky="ew", pady=(8,0))
        ttk.Label(frame, text="Prompt").grid(row=2, column=0, sticky="nw", pady=(10,0))
        prompt_text = tk.Text(frame, height=12, wrap="word")
        prompt_text.grid(row=2, column=1, columnspan=3, sticky="nsew", padx=8, pady=(10,0))
        frame.rowconfigure(2, weight=1)
        if existing:
            prompt_text.insert("1.0", existing.prompt)
        ttk.Label(frame, text="Attachments").grid(row=3, column=0, sticky="nw", pady=(10,0))
        listbox = tk.Listbox(frame, height=5)
        listbox.grid(row=3, column=1, columnspan=3, sticky="nsew", padx=8, pady=(10,0))
        def fill_list():
            listbox.delete(0, "end")
            for p in attachments:
                listbox.insert("end", p)
        def add_files():
            files = filedialog.askopenfilenames(title="Select images/files")
            for f in files:
                if f not in attachments:
                    attachments.append(f)
            fill_list()
        def remove_files():
            for row in reversed(list(listbox.curselection())):
                attachments.pop(row)
            fill_list()
        buttons = ttk.Frame(frame)
        buttons.grid(row=4, column=1, columnspan=3, sticky="w", padx=8, pady=(8,0))
        ttk.Button(buttons, text="Add Files", command=add_files).pack(side="left", padx=(0,6))
        ttk.Button(buttons, text="Remove", command=remove_files).pack(side="left")
        ttk.Label(frame, text="Output name").grid(row=5, column=0, sticky="w", pady=(10,0))
        ttk.Entry(frame, textvariable=output_var).grid(row=5, column=1, columnspan=3, sticky="ew", padx=8, pady=(10,0))
        footer = ttk.Frame(frame)
        footer.grid(row=6, column=0, columnspan=4, sticky="e", pady=(12,0))
        def save():
            prompt = prompt_text.get("1.0", "end").strip()
            if not shot_var.get().strip() or not prompt:
                messagebox.showerror(APP_TITLE, "Shot ID and prompt are required.")
                return
            result["item"] = ShotItem(
                profile=profile_var.get().strip(), job_type=type_var.get().strip(), shot_id=shot_var.get().strip(),
                prompt=prompt, attachments=list(attachments), delay_sec=int(delay_var.get()),
                status=existing.status if existing else "pending", output_name=output_var.get().strip()
            )
            dialog.destroy()
        ttk.Button(footer, text="Cancel", command=dialog.destroy).pack(side="right", padx=(6,0))
        ttk.Button(footer, text="Save", command=save).pack(side="right")
        fill_list()
        dialog.wait_window()
        return result["item"]

    def start(self) -> None:
        if self.busy:
            messagebox.showinfo(APP_TITLE, "Sender is already running.")
            return
        if not self.items:
            messagebox.showinfo(APP_TITLE, "Import or add queue items first.")
            return
        self.save_current_profile()
        self.stop_event.clear()
        self.busy = True
        self.worker = threading.Thread(target=self.worker_loop, daemon=True)
        self.worker.start()
        self.status_var.set("Started.")

    def stop(self) -> None:
        self.stop_event.set()
        self.status_var.set("Stopping after current step...")

    def send_selected(self) -> None:
        idx = self.selected_index()
        if idx is None:
            return
        if self.busy:
            messagebox.showinfo(APP_TITLE, "Stop current run first.")
            return
        self.save_current_profile()
        self.stop_event.clear()
        self.busy = True
        self.worker = threading.Thread(target=lambda: self.worker_loop([idx]), daemon=True)
        self.worker.start()

    def worker_loop(self, only_indices: list[int] | None = None) -> None:
        try:
            indices = only_indices if only_indices is not None else list(range(len(self.items)))
            for idx in indices:
                if self.stop_event.is_set():
                    break
                item = self.items[idx]
                if self.skip_sent_var.get() and item.status.lower() == "sent":
                    self.ui_queue.put(("status", f"Skipped sent: {item.shot_id}"))
                    continue
                self.ui_queue.put(("status", f"Sending {item.shot_id}..."))
                item.status = "sending"
                self.ui_queue.put(("refresh", None))
                self.autosave_queue()
                try:
                    self.send_item(item)
                    item.status = "sent"
                    self.ui_queue.put(("status", f"Sent {item.shot_id}"))
                except Exception as exc:
                    item.status = "failed"
                    self.ui_queue.put(("status", f"Failed {item.shot_id}: {exc}"))
                    self.write_log(f"Failed {item.shot_id}: {exc}")
                self.ui_queue.put(("refresh", None))
                self.autosave_queue()
                if only_indices is None and idx != indices[-1]:
                    self.wait_or_stop(max(1, int(item.delay_sec)), f"Waiting after {item.shot_id}")
        finally:
            self.busy = False
            self.ui_queue.put(("done", None))

    def send_item(self, item: ShotItem) -> None:
        self.focus_countdown(item.shot_id)
        if item.attachments:
            for i, path in enumerate(item.attachments, start=1):
                if self.stop_event.is_set():
                    raise RuntimeError("Stopped by user")
                if self.click_each_var.get():
                    self.click_target()
                retry(f"Set file clipboard {item.shot_id}", lambda p=path: set_file_clipboard_windows([p]))
                time.sleep(0.2)
                retry(f"Paste file {item.shot_id}", send_ctrl_v)
                self.write_log(f"{item.shot_id}: pasted file {i}/{len(item.attachments)} {path}")
                self.wait_or_stop(max(1, int(self.file_gap_var.get())), f"Uploading file {i}/{len(item.attachments)}")
            self.wait_or_stop(max(1, int(self.upload_var.get())), f"Upload wait for {item.shot_id}")
        if self.click_each_var.get():
            self.click_target()
        prompt = item.prompt.strip()
        retry(f"Set prompt clipboard {item.shot_id}", lambda: set_text_clipboard_windows(prompt))
        time.sleep(0.25)
        retry(f"Paste prompt {item.shot_id}", send_ctrl_v)
        time.sleep(0.3)
        retry(f"Press Enter {item.shot_id}", send_enter)
        self.write_log(f"Sent {item.shot_id}, chars={len(prompt)}, refs={len(item.attachments)}")

    def wait_or_stop(self, seconds: int, label: str) -> None:
        for remaining in range(seconds, 0, -1):
            if self.stop_event.is_set():
                raise RuntimeError("Stopped by user")
            if remaining % 10 == 0 or remaining <= 5:
                self.ui_queue.put(("status", f"{label}: {remaining}s"))
            time.sleep(1)

    def write_log(self, msg: str) -> None:
        stamp = time.strftime("%Y-%m-%d %H:%M:%S")
        try:
            LOG_PATH.open("a", encoding="utf-8").write(f"[{stamp}] {msg}\n")
        except OSError:
            pass

    def drain_ui_queue(self) -> None:
        try:
            while True:
                kind, payload = self.ui_queue.get_nowait()
                if kind == "status":
                    self.status_var.set(str(payload))
                elif kind == "refresh":
                    self.refresh_table()
                elif kind == "done":
                    self.deiconify()
                    self.status_var.set("Queue done." if not self.stop_event.is_set() else "Stopped.")
                    self.refresh_table()
        except queue.Empty:
            pass
        self.after(200, self.drain_ui_queue)


def main() -> None:
    app = PromptSenderApp()
    app.mainloop()


if __name__ == "__main__":
    main()

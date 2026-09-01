Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WindowHelper {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$processes = Get-Process | Where-Object { $_.ProcessName -like "*qemu*" -or $_.ProcessName -like "*emulator*" }
foreach ($proc in $processes) {
    if ($proc.MainWindowHandle -ne [IntPtr]::Zero) {
        [WindowHelper]::ShowWindow($proc.MainWindowHandle, 9)
        [WindowHelper]::SetForegroundWindow($proc.MainWindowHandle)
        Write-Host "Restored and focused: $($proc.ProcessName) (PID: $($proc.Id), Title: $($proc.MainWindowTitle))"
    } else {
        Write-Host "Process running without direct MainWindowHandle: $($proc.ProcessName) (PID: $($proc.Id))"
    }
}

package com.plan4u.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void vibrate(PluginCall call) {
        int duration = call.getInt("duration", 25);
        String style = call.getString("style", "light");
        Context context = getContext();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vm != null) {
                    Vibrator v = vm.getDefaultVibrator();
                    if (v != null && v.hasVibrator()) {
                        if ("achievement".equals(style)) {
                            long[] timings = new long[]{0, 50, 70, 70};
                            int[] amplitudes = new int[]{0, 190, 0, 255};
                            v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1));
                        } else if ("heavy".equals(style)) {
                            v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK));
                        } else if ("medium".equals(style)) {
                            v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK));
                        } else {
                            v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK));
                        }
                    }
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if ("achievement".equals(style)) {
                        long[] timings = new long[]{0, 50, 70, 70};
                        int[] amplitudes = new int[]{0, 190, 0, 255};
                        v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1));
                    } else if ("heavy".equals(style)) {
                        v.vibrate(VibrationEffect.createOneShot(Math.max(duration, 40), VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(VibrationEffect.createOneShot(duration, 160));
                    }
                }
            } else {
                Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    v.vibrate(duration);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        call.resolve();
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String tasksJson = call.getString("tasksJson", "[]");
        String dateStr = call.getString("dateStr", "");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PriorityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putString(PriorityWidgetProvider.KEY_TASKS_JSON, tasksJson)
                .putString("widget_selected_date", dateStr)
                .apply();

        // Update all widgets on home screen
        PriorityWidgetProvider.updateAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getWidgetData(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PriorityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        String tasksJson = prefs.getString(PriorityWidgetProvider.KEY_TASKS_JSON, "[]");
        String dateStr = prefs.getString("widget_selected_date", "");

        JSObject ret = new JSObject();
        ret.put("tasksJson", tasksJson);
        ret.put("dateStr", dateStr);
        call.resolve(ret);
    }
}

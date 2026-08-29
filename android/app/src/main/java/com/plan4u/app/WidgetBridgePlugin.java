package com.plan4u.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

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

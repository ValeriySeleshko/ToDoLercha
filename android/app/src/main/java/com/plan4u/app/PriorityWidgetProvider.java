package com.plan4u.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Paint;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class PriorityWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH_WIDGET = "com.plan4u.app.ACTION_REFRESH_WIDGET";
    public static final String ACTION_TOGGLE_TASK = "com.plan4u.app.ACTION_TOGGLE_TASK";
    public static final String EXTRA_TASK_ID = "com.plan4u.app.EXTRA_TASK_ID";
    public static final String PREFS_NAME = "plan4u_widget_prefs";
    public static final String KEY_TASKS_JSON = "widget_tasks_json";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.priority_widget_layout);

        // 1. Setup RemoteViewsService adapter for ListView
        Intent serviceIntent = new Intent(context, PriorityWidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.widget_list_view, serviceIntent);
        views.setEmptyView(R.id.widget_list_view, R.id.widget_empty_view);

        // 2. Click on item in list (PendingIntent template)
        Intent clickIntent = new Intent(context, PriorityWidgetProvider.class);
        clickIntent.setAction(ACTION_TOGGLE_TASK);
        clickIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent clickPendingIntent = PendingIntent.getBroadcast(
                context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
        views.setPendingIntentTemplate(R.id.widget_list_view, clickPendingIntent);

        // 3. Open MainActivity on header tap / Add button tap
        Intent openAppIntent = new Intent(context, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(
                context, 1, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_header, openAppPendingIntent);
        views.setOnClickPendingIntent(R.id.widget_btn_add, openAppPendingIntent);
        views.setOnClickPendingIntent(R.id.widget_empty_btn, openAppPendingIntent);

        // 4. Refresh button intent
        Intent refreshIntent = new Intent(context, PriorityWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH_WIDGET);
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
                context, 2, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_refresh, refreshPendingIntent);

        // 5. Read tasks stats and update counter
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String tasksJsonStr = prefs.getString(KEY_TASKS_JSON, "[]");
        int totalImportant = 0;
        int completedImportant = 0;

        try {
            JSONArray arr = new JSONArray(tasksJsonStr);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                boolean isEmpty = obj.optBoolean("isEmpty", false);
                String text = obj.optString("text", "").trim();
                if (isEmpty || text.isEmpty()) continue;

                String priority = obj.optString("priority", "").toLowerCase();
                String textLower = text.toLowerCase();
                boolean isImportant = priority.equals("важный") || priority.equals("очень важно")
                        || priority.equals("вопрос жизни и смерти") || textLower.contains("очень важно")
                        || textLower.contains("жизни и смерти");

                if (isImportant) {
                    totalImportant++;
                    if (obj.optBoolean("completed", false)) {
                        completedImportant++;
                    }
                }
            }
        } catch (Exception ignored) {}

        if (totalImportant > 0) {
            views.setTextViewText(R.id.widget_counter, completedImportant + "/" + totalImportant);
            if (completedImportant == totalImportant) {
                views.setTextViewText(R.id.widget_title_icon, "🎉");
            } else {
                views.setTextViewText(R.id.widget_title_icon, "⚡");
            }
        } else {
            views.setTextViewText(R.id.widget_counter, "0/0");
            views.setTextViewText(R.id.widget_title_icon, "⚡");
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list_view);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, PriorityWidgetProvider.class));
        for (int id : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, id);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();

        if (ACTION_REFRESH_WIDGET.equals(action)) {
            updateAllWidgets(context);
        } else if (ACTION_TOGGLE_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            if (taskId != null) {
                toggleTaskInPrefs(context, taskId);
                updateAllWidgets(context);
            }
        }
    }

    private void toggleTaskInPrefs(Context context, String taskId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String tasksJsonStr = prefs.getString(KEY_TASKS_JSON, "[]");
        try {
            JSONArray arr = new JSONArray(tasksJsonStr);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                if (taskId.equals(obj.optString("id"))) {
                    boolean completed = obj.optBoolean("completed", false);
                    obj.put("completed", !completed);
                    break;
                }
            }
            prefs.edit().putString(KEY_TASKS_JSON, arr.toString()).apply();
        } catch (Exception ignored) {}
    }
}

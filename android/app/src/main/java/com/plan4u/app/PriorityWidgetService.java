package com.plan4u.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class PriorityWidgetService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new PriorityWidgetFactory(this.getApplicationContext(), intent);
    }

    private static class PriorityWidgetFactory implements RemoteViewsService.RemoteViewsFactory {

        private final Context context;
        private final List<JSONObject> importantTasks = new ArrayList<>();

        public PriorityWidgetFactory(Context context, Intent intent) {
            this.context = context;
        }

        @Override
        public void onCreate() {
            loadTasks();
        }

        @Override
        public void onDataSetChanged() {
            loadTasks();
        }

        private void loadTasks() {
            importantTasks.clear();
            SharedPreferences prefs = context.getSharedPreferences(PriorityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(PriorityWidgetProvider.KEY_TASKS_JSON, "[]");
            try {
                JSONArray arr = new JSONArray(jsonStr);
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
                        importantTasks.add(obj);
                    }
                }
            } catch (Exception ignored) {}
        }

        @Override
        public void onDestroy() {
            importantTasks.clear();
        }

        @Override
        public int getCount() {
            return importantTasks.size();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            if (position < 0 || position >= importantTasks.size()) return null;

            JSONObject task = importantTasks.get(position);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.priority_widget_item);

            String text = task.optString("text", "");
            boolean completed = task.optBoolean("completed", false);
            String time = task.optString("time", "");
            String section = task.optString("section", "");

            // Clean parentheses tags if present
            String cleanText = text
                    .replaceAll("(?i)\\s*\\(вопрос жизни и смерти\\)", "")
                    .replaceAll("(?i)\\s*\\(очень важно\\)", "")
                    .replaceAll("(?i)\\s*\\(в течении дня\\)", "")
                    .replaceAll("(?i)\\s*\\(перенесено\\)", "")
                    .trim();

            views.setTextViewText(R.id.widget_item_text, cleanText.isEmpty() ? text : cleanText);

            if (completed) {
                views.setTextViewText(R.id.widget_item_checkbox, "✅");
                views.setTextColor(R.id.widget_item_text, Color.parseColor("#94A3B8"));
            } else {
                views.setTextViewText(R.id.widget_item_checkbox, "⭕");
                views.setTextColor(R.id.widget_item_text, Color.parseColor("#0F172A"));
            }

            // Time badge
            if (time != null && !time.trim().isEmpty()) {
                views.setViewVisibility(R.id.widget_item_time, View.VISIBLE);
                views.setTextViewText(R.id.widget_item_time, "⏰ " + time);
            } else {
                views.setViewVisibility(R.id.widget_item_time, View.GONE);
            }

            // Section badge
            String sectionLabel = getSectionLabel(section);
            if (sectionLabel != null && !sectionLabel.isEmpty()) {
                views.setViewVisibility(R.id.widget_item_sec, View.VISIBLE);
                views.setTextViewText(R.id.widget_item_sec, sectionLabel);
            } else {
                views.setViewVisibility(R.id.widget_item_sec, View.GONE);
            }

            // Fill-in intent for item click
            Intent fillInIntent = new Intent();
            fillInIntent.putExtra(PriorityWidgetProvider.EXTRA_TASK_ID, task.optString("id"));
            views.setOnClickFillInIntent(R.id.widget_item_root, fillInIntent);

            return views;
        }

        private String getSectionLabel(String sec) {
            if (sec == null) return null;
            sec = sec.toLowerCase();
            if (sec.contains("spirit") || sec.contains("духов")) return "🕊️ Духовные";
            if (sec.contains("person") || sec.contains("личн")) return "👤 Личные";
            if (sec.contains("house") || sec.contains("дом")) return "🏠 Домашние";
            if (sec.contains("cook") || sec.contains("приготов")) return "🍳 Кухня";
            if (sec.contains("other") || sec.contains("друг") || sec.contains("план")) return "📋 Планы";
            return null;
        }

        @Override
        public RemoteViews getLoadingView() {
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }
    }
}

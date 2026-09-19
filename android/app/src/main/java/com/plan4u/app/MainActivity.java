package com.plan4u.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);

        // Unlock 120Hz display refresh rate on Samsung Galaxy S24 Ultra, S23 and high refresh devices
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Display display = getDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    Display.Mode maxMode = null;
                    for (Display.Mode mode : modes) {
                        if (maxMode == null || mode.getRefreshRate() > maxMode.getRefreshRate()) {
                            maxMode = mode;
                        }
                    }
                    if (maxMode != null) {
                        WindowManager.LayoutParams params = getWindow().getAttributes();
                        params.preferredDisplayModeId = maxMode.getModeId();
                        getWindow().setAttributes(params);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        // Enable hardware accelerated rendering layer on WebView
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                WebSettings settings = webView.getSettings();
                settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "(function(){ try { if (window.app && typeof window.app.handleHardwareBack === 'function') { return window.app.handleHardwareBack(); } } catch(e){} return false; })()",
                value -> {
                    if (!"true".equals(value)) {
                        runOnUiThread(() -> MainActivity.super.onBackPressed());
                    }
                }
            );
            return;
        }
        super.onBackPressed();
    }
}

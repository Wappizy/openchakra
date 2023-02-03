package com.dekuple.tensiometre

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class WithingsLink(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "WithingsLink"
    @ReactMethod fun openInstall() {
        if (getReactApplicationContextIfActiveOrWarn()!=null) {
          getReactApplicationContextIfActiveOrWarn()!!.startActivity(WithingsActivity.createInstallIntent(getReactApplicationContextIfActiveOrWarn()!!));
        }
    }

    @ReactMethod fun openSettings(accessToken: String) {
        if (getReactApplicationContextIfActiveOrWarn()!=null) {
          getReactApplicationContextIfActiveOrWarn()!!.startActivity(WithingsActivity.createSettingsIntent(getReactApplicationContextIfActiveOrWarn()!!, accessToken));
        }
    }

    @ReactMethod fun sayHello(promise:Promise) {
        //Log.d("WithongsLink", "sayHello called");
        return promise.resolve("Bonjour")
    }

}


package com.arifaydogmus.safetynet;

import android.support.annotation.NonNull;
import android.app.Activity;
import android.util.Base64;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.safetynet.SafetyNet;
import com.google.android.gms.safetynet.SafetyNetApi;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import java.nio.charset.StandardCharsets;
import java.lang.IllegalArgumentException;

public class RNSafetyNetModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;
  private final ReactApplicationContext baseContext;
  private final Activity activity;

  public RNSafetyNetModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.baseContext = getReactApplicationContext();
    this.activity = getCurrentActivity();
  }

  @Override
  public String getName() {
    return "RNSafetyNet";
  }

  /**
  * Checks if Google Play Services is available and up to date
  * See https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability
  * @param promise
  */
  @ReactMethod
  public void isPlayServicesAvailable(final Promise promise){
    ConnectionResult result = new ConnectionResult(GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(baseContext));
    if (result.isSuccess()){
      promise.resolve(true);
    }
    else {
      promise.reject(result.getErrorMessage());
    }
  }

  /**
   * Send a request to the SafetyNet Attestation API
   * See https://developer.android.com/training/safetynet/attestation.html#compat-check-request
   * @param nonceString
   * @param apiKey
   * @param promise
   */
  @ReactMethod
  public void sendAttestationRequest(String nonceString, String apiKey, final Promise promise){
    byte[] nonce;
    Activity activity;
    nonce = stringToBytes(nonceString);
    activity = getCurrentActivity();
    SafetyNet.getClient(baseContext).attest(nonce, apiKey)
    .addOnSuccessListener(activity,
    new OnSuccessListener<SafetyNetApi.AttestationResponse>() {
      @Override
      public void onSuccess(SafetyNetApi.AttestationResponse response) {
        String result = response.getJwsResult();
        promise.resolve(result);
      }
    })
    .addOnFailureListener(activity, new OnFailureListener() {
      @Override
      public void onFailure(@NonNull Exception e) {
        promise.reject(e);
      }
    });
  }

  private byte[] stringToBytes(String string) {
    byte[] bytes;
    bytes = null;
    try {
      bytes = Base64.decode(string, Base64.DEFAULT);
    } catch(IllegalArgumentException e) {
      e.printStackTrace();
    }
    return bytes;
  }

}

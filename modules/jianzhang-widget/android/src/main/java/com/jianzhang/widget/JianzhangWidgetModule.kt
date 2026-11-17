package com.jianzhang.widget
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.appwidget.AppWidgetManager
import android.content.*
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.net.Uri
import android.os.Build
import org.json.JSONObject
class JianzhangWidgetModule: Module() {
 override fun definition()=ModuleDefinition {
  Name("JianzhangWidget")
  AsyncFunction("setPaymentCapture") { enabled:Boolean ->
   val context=appContext.reactContext?:return@AsyncFunction
   val prefs=context.getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE)
   prefs.edit().putBoolean("capture_payments",enabled).apply()
   if(enabled)context.startActivity(Intent(android.provider.Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
   else prefs.edit().remove("payment_drafts").apply()
  }
  AsyncFunction("getPaymentDrafts") {
   appContext.reactContext?.getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE)?.getString("payment_drafts","[]")?:"[]"
  }
  AsyncFunction("removePaymentDraft") { id:String ->
   val prefs=appContext.reactContext?.getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE)?:return@AsyncFunction
   val old=org.json.JSONArray(prefs.getString("payment_drafts","[]")?:"[]");val next=org.json.JSONArray()
   for(i in 0 until old.length())if(old.getJSONObject(i).optString("id")!=id)next.put(old.getJSONObject(i))
   prefs.edit().putString("payment_drafts",next.toString()).apply()
  }
  AsyncFunction("updateSummary") { summary:String ->
   val context=appContext.reactContext?:return@AsyncFunction
   context.getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE).edit().putString("summary",summary).commit()
   val manager=AppWidgetManager.getInstance(context)
   val ids=manager.getAppWidgetIds(ComponentName(context,JianzhangWidgetProvider::class.java))
   JianzhangWidgetProvider().onUpdate(context,manager,ids)
   if(Build.VERSION.SDK_INT>=25){
    val url=JSONObject(summary).optString("url","react-native-shadcn-ui:///bookkeeping?compose=1")
    val intent=Intent(Intent.ACTION_VIEW,Uri.parse(url)).setPackage(context.packageName)
    context.packageManager.getLaunchIntentForPackage(context.packageName)?.component?.let {intent.component=it}
    val shortcut=ShortcutInfo.Builder(context,"jianzhang-add").setShortLabel("记一笔").setLongLabel("简账 · 快速记账").setIntent(intent).build()
    val shortcuts=context.getSystemService(ShortcutManager::class.java)
    shortcuts.dynamicShortcuts=(shortcuts.dynamicShortcuts.filter {it.id!="jianzhang-add"}.take((shortcuts.maxShortcutCountPerActivity-1).coerceAtLeast(0))+shortcut)
   }
  }
 }
}

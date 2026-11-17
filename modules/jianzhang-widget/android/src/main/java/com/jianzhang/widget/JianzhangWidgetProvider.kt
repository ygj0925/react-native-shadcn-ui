package com.jianzhang.widget
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.*
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject

class JianzhangWidgetProvider: AppWidgetProvider() {
 override fun onUpdate(context:Context, manager:AppWidgetManager, ids:IntArray) {
  val data=try{JSONObject(context.getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE).getString("summary","{}")?:"{}")}catch(_:Exception){JSONObject()}
  for(id in ids){
   val view=RemoteViews(context.packageName,R.layout.jianzhang_widget)
   view.setTextViewText(R.id.jianzhang_title,"${data.optString("bookName","简账")} · 今日支出")
   val today=java.text.SimpleDateFormat("yyyy-MM-dd",java.util.Locale.ROOT).format(java.util.Date())
   view.setTextViewText(R.id.jianzhang_amount,if(data.optString("date")!=today)"打开App更新" else if(data.optBoolean("hide",true))"••••" else "¥${data.optString("todayExpense","0.00")}")
   val url=data.optString("url","react-native-shadcn-ui:///bookkeeping?compose=1")
   val intent=Intent(Intent.ACTION_VIEW,Uri.parse(url)).setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
   val pending=PendingIntent.getActivity(context,id,intent,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
   view.setOnClickPendingIntent(R.id.jianzhang_root,pending);manager.updateAppWidget(id,view)
  }
 }
}

import WidgetKit
import SwiftUI
struct LedgerWidgetEntry:TimelineEntry {let date:Date;let title:String;let amount:String;let url:URL?}
struct LedgerWidgetProvider:TimelineProvider {
 func placeholder(in context:Context)->LedgerWidgetEntry{LedgerWidgetEntry(date:Date(),title:"简账 · 今日支出",amount:"••••",url:nil)}
 func getSnapshot(in context:Context,completion:@escaping(LedgerWidgetEntry)->Void){completion(read())}
 func getTimeline(in context:Context,completion:@escaping(Timeline<LedgerWidgetEntry>)->Void){completion(Timeline(entries:[read()],policy:.after(Date().addingTimeInterval(1800))))}
 func read()->LedgerWidgetEntry{
  let group=Bundle.main.object(forInfoDictionaryKey:"JianzhangAppGroup") as? String ?? ""
  let raw=UserDefaults(suiteName:group)?.string(forKey:"summary") ?? "{}"
  let json=(try? JSONSerialization.jsonObject(with:Data(raw.utf8))) as? [String:Any] ?? [:]
  let formatter=DateFormatter();formatter.dateFormat="yyyy-MM-dd"
  let current=(json["date"] as? String)==formatter.string(from:Date())
  let hidden=json["hide"] as? Bool ?? true
  return LedgerWidgetEntry(date:Date(),title:"\(json["bookName"] as? String ?? "简账") · 今日支出",amount:!current ? "打开App更新" : hidden ? "••••" : "¥\(json["todayExpense"] as? String ?? "0.00")",url:URL(string:json["url"] as? String ?? "react-native-shadcn-ui:///bookkeeping?compose=1"))
 }
}
@main struct JianzhangWidget:Widget {
 var body:some WidgetConfiguration {
  StaticConfiguration(kind:"JianzhangWidget",provider:LedgerWidgetProvider()){entry in
   VStack(alignment:.leading,spacing:12){Text(entry.title).font(.caption);Text(entry.amount).font(.title).bold().minimumScaleFactor(0.5);Text("＋ 记一笔").font(.subheadline)}.frame(maxWidth:.infinity,alignment:.leading).foregroundStyle(Color(red:0.14,green:0.16,blue:0.15)).containerBackground(Color(red:0.95,green:0.79,blue:0.41),for:.widget).widgetURL(entry.url)
  }.configurationDisplayName("简账").description("查看今日支出，快速记一笔。默认隐藏金额。").supportedFamilies([.systemSmall,.systemMedium])
 }
}

import ExpoModulesCore
import WidgetKit
import UIKit
public class JianzhangWidgetModule: Module {
 public func definition() -> ModuleDefinition {
  Name("JianzhangWidget")
  AsyncFunction("updateSummary") { (summary: String) in
   guard let group = Bundle.main.object(forInfoDictionaryKey: "JianzhangAppGroup") as? String else { return }
   UserDefaults(suiteName: group)?.set(summary, forKey: "summary")
   WidgetCenter.shared.reloadTimelines(ofKind: "JianzhangWidget")
   guard let data=summary.data(using: .utf8),let json=try? JSONSerialization.jsonObject(with:data) as? [String:Any],let url=json["url"] as? String else {return}
   let item=UIApplicationShortcutItem(type:"jianzhang-add",localizedTitle:"记一笔",localizedSubtitle:"简账 · 快速记账",icon:UIApplicationShortcutIcon(type:.add),userInfo:["url":url as NSString])
   DispatchQueue.main.async { UIApplication.shared.shortcutItems=[item] }
  }
 }
}
public class JianzhangShortcutSubscriber: ExpoAppDelegateSubscriber {
 public func application(_ application:UIApplication,didFinishLaunchingWithOptions launchOptions:[UIApplication.LaunchOptionsKey:Any]? = nil)->Bool{
  if let shortcut=launchOptions?[.shortcutItem] as? UIApplicationShortcutItem,let raw=shortcut.userInfo?["url"] as? String,let url=URL(string:raw){DispatchQueue.main.asyncAfter(deadline:.now()+1){application.open(url,options:[:],completionHandler:nil)}}
  return true
 }
 public func application(_ application:UIApplication,performActionFor shortcutItem:UIApplicationShortcutItem,completionHandler:@escaping(Bool)->Void){
  guard shortcutItem.type=="jianzhang-add",let raw=shortcutItem.userInfo?["url"] as? String,let url=URL(string:raw) else{completionHandler(false);return}
  application.open(url,options:[:],completionHandler:completionHandler)
 }
}

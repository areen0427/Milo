import Foundation
import UserNotifications

// Called by Milo's service with a fixed event kind; never asks for authorization.
if CommandLine.arguments.dropFirst().first == "--identity" {
    print(Bundle.main.bundleIdentifier ?? "none")
    exit(0)
}
let kind = CommandLine.arguments.dropFirst().first ?? ""
if kind == "--status" {
    let finished = DispatchSemaphore(value: 0)
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        print(settings.authorizationStatus.rawValue)
        finished.signal()
    }
    if finished.wait(timeout: .now() + 5) == .timedOut { fputs("Status query timed out\n", stderr); exit(1) }
    exit(0)
}
if kind == "--request" {
    let finished = DispatchSemaphore(value: 0)
    var result: Int32 = 1
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { granted, error in
        if let error = error { fputs("Authorization failed: \(error.localizedDescription)\n", stderr) }
        else { result = granted ? 0 : 3 }
        finished.signal()
    }
    if finished.wait(timeout: .now() + 120) == .timedOut { fputs("Authorization timed out\n", stderr); exit(1) }
    exit(result)
}
let title: String
let body: String
switch kind {
case "complete": title = "Milo task complete"; body = "A task has finished."
case "approval": title = "Milo needs approval"; body = "A task is waiting for your decision."
default: fputs("Invalid notification type\n", stderr); exit(2)
}
let done = DispatchSemaphore(value: 0)
let center = UNUserNotificationCenter.current()
var outcome: Int32 = 1
center.getNotificationSettings { settings in
    guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else {
        fputs("Notifications are not authorized for Milo\n", stderr)
        done.signal(); return
    }
    let content = UNMutableNotificationContent()
    content.title = title; content.body = body
    center.add(UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)) { error in
        if let error = error { fputs("Notification failed: \(error.localizedDescription)\n", stderr) }
        else { outcome = 0 }
        done.signal()
    }
}
if done.wait(timeout: .now() + 5) == .timedOut { fputs("Notification timed out\n", stderr); exit(1) }
exit(outcome)

// 低レベルなイベントを高レベルなイベントに変換する
// 例: controllers -> diffを取得 -> updateLink みたいに
//     notification -> checkBattery などに
import subjects from "../subjects/appSubjects";

class ActionCreator {
  raiseEvent(eventName, data) {
    switch (eventName) {
      case "notifications":
        switch (data.type) {
          case "addOrb":
            subjects.addOrb.publish({
              name: data.orbName,
              port: data.orbPort
            });
            break;
        }
    }
  }
}

export default new ActionCreator();
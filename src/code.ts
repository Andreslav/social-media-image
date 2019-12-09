import { dispatch, handleEvent } from './handlers/codeMessageHandler';

figma.showUI(__html__, {width:260, height:410})
dispatch('set-settings', getSettings())


handleEvent("create-frame", (data: CreateSize) => {
    let settings = getSettings()
    let viewport = figma.viewport.center
    let selection = figma.currentPage.selection[0], x:number, y:number

    let node = figma.createFrame()
    node.name =  data.list + " | " + data.name
    node.resize( data.width,  data.height)

    if (settings.isCreateGuides) {
      node.guides = data.guides
    }
    if (settings.isCreateShapes) {
      data.shapes.forEach(e => {
        switch (e.type) {
          case "round":
            let rect = figma.createRectangle()
            rect.resize( e.radius * 2,  e.radius * 2)

            let round = figma.createEllipse()
            round.resize( e.radius * 2,  e.radius * 2)

            let subtract = figma.subtract([rect, round], node)
            subtract.x = e.x
            subtract.y = e.y
            subtract.fills = [{type:"SOLID", visible:true, "color": {"r":0.26406246423721313,"g":0.37781253457069397,"b":0.9750000238418579}, opacity:0.10000000149011612, blendMode:"NORMAL"}]
            subtract.locked = settings.isLockHelperShapes
            
            break;
        }
      })
    }
    
    if (selection && selection.type == "FRAME") {
      x = selection.x + selection.width + 40
      y = selection.y
    } else {
      x = viewport.x - node.width / 2
      y = viewport.y - node.height / 2
    }

    node.x = x
    node.y = y

    figma.currentPage.selection = [node]
    figma.notify("Frame created")
});

handleEvent("save-settings", (data: Settings) => {
  setPluginData("settings", Object.assign({}, getPluginData("settings"), data))
})



function getSettings(): Settings {
  let defaultSettings = {
    isCreateGuides: true,
    isCreateShapes: true,
    isLockHelperShapes: true
  }

  return Object.assign(defaultSettings, getPluginData("settings"))
}
function getPluginData(key: string, base:any = {}): any {
  let pluginData = figma.root.getPluginData(key)
  return pluginData ? JSON.parse(pluginData) : base
}
function setPluginData(key: string, pluginData: any): any {
  figma.root.setPluginData(key, JSON.stringify(pluginData))
  return pluginData
}
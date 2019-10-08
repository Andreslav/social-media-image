figma.showUI(__html__, {width:260, height:400})

figma.ui.onmessage = msg => {
  if (msg.type === 'create-frame') {
    var viewport = figma.viewport.center
    var selection = figma.currentPage.selection[0], x:number, y:number
    
    var node = figma.createFrame()
    node.guides = msg.data.guides
    node.name =  msg.data.list + " | " + msg.data.name
    node.resizeWithoutConstraints( msg.data.width,  msg.data.height)
    
    if (selection && selection.type == "FRAME") {
      x = selection.x + selection.width + 40
      y = selection.y
    } else {
      if (node.width < 600) { 
        x = viewport.x - 800
        y = viewport.y - node.height / 2
      } else {
        x = viewport.x - node.width / 2
        y = viewport.y - node.height / 2
      }
    }

    node.x = x
    node.y = y

    figma.viewport.scrollAndZoomIntoView([node])
    figma.currentPage.selection = [node]
    figma.notify("Frame created")
  }
}
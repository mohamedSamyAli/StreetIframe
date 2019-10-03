import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
import{mapDispatchToProps,mapStateToProps}from"./maping"
import{connect}from "react-redux"
const options = {
  url: 'https://js.arcgis.com/3.29/'
};

const styles =  {
  container: {
    height: '100vh',
    width: '100%'
  },
  mapDiv: {
    padding: 0,
    margin: 0,
    height: '100%',
    width: '100%'
  },
}

class MapComponent extends Component {

 
 

  componentDidMount() {
    
    console.log(this.props)
    loadModules(["dojo/i18n!esri/nls/jsapi","esri/toolbars/draw",'esri/map','esri/layers/ArcGISDynamicMapServiceLayer',"esri/symbols/SimpleFillSymbol","esri/graphic"], options)
      .then(([bundel,Draw,Map,ArcGISDynamicMapServiceLayer,SimpleFillSymbol,Graphic]) => {
        
        console.log(">>>>>>>>>",bundel)
        bundel.toolbars.draw.addPoint="اضغط لاضافة نقطه"
        bundel.toolbars.draw.start="اضغط لبدا الرسم"
        bundel.toolbars.draw.complete="اضغط مرتان لانهاء الرسم"
        bundel.toolbars.draw.resume="اضغط للاستمرار فى الرسم"
        this.graphic = Graphic;
        this.SimpleFillSymbol = new SimpleFillSymbol();
        this.map = new Map("map", {
         // basemap: 'dark-gray'
        });
        this.props.setmap(this.map)
        this.props.setToolBar(new Draw(this.map))
        var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer
        ("http://webgis.eamana.gov.sa/arcgisnew/rest/services/MAPVIEWERSERVICE/MapServer", {
          "opacity" : 0.5
          ,"id":"kajshdfkjashd"
        });
        this.map.on("layer-add",(res)=>{this.map.setExtent(res.layer.fullExtent)})
        this.map.addLayer(dynamicMapServiceLayer,2); 
      });

  }

componentWillReceiveProps(){
  console.log(this.props.poly)

if(this.props.poly)
{
  this.map.graphics.clear();
this.map.graphics.add(new this.graphic(this.props.poly,this.SimpleFillSymbol))
}
  console.log(this.props.mapExtend)
  if(this.props.mapExtend){
    this.map.setExtent(this.props.mapExtend)
  }
}
  render() {
    return(
          <div style={styles.container}>
            <div id='map' Style="
    height: 100vh;
" >         
          </div>
       </div>
    )
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(MapComponent);
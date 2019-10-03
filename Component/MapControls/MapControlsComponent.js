import React, { Component } from 'react'
import { loadModules } from 'esri-loader';
import { Select , Button , Tooltip } from 'antd';
import 'antd/dist/antd.css';
import MapComponent from"../MapComponent/MapComponent"
import {highlightFeature}from"../common/common_func"
import{mapDispatchToProps,mapStateToProps}from"./maping"
import{connect}from "react-redux"
import '../../App'
import logo from '../common/images/marker.png';

import{selectDis,DataQuery,queryOption}from'./Helpers'
import { jsxExpressionContainer } from '@babel/types';
var uniqid = require('uniqid');
const { Option } = Select;

const options = {
    url: 'https://js.arcgis.com/3.29/'
  };

 class MapControlsComponent extends Component {
     constructor(){
       super()
       window.WorksData=window.WorksData?window.WorksData:{};
       
       window.WorksData.FREEHAND_POLYGON=window.WorksData.FREEHAND_POLYGON?window.WorksData.FREEHAND_POLYGON:[]
       window.WorksData.Shape=window.WorksData.Shape?window.WorksData.Shape:[]
       window.WorksData.POINT=window.WorksData.POINT?window.WorksData.POINT:[]
       this.f = true
       this.type=null
       this.DelShape=false
       this.symbol = null
       this.DistictDominObject={};
       this.DistictDomin=[]
       console.log(this.props)
       this.isFromIframe = true;
       this.state=
       {
        DISTRICT_NAME:null,
        STREET_NAME:null,
        MUN_NAME:null,
       disabled:false,
       spinning:false,
       MunicipalityNames:[],
       DistictNames:[],
       StreetNum:[],
       DistrictId:undefined,
       StreetId:undefined,
       MunicipalityId:undefined
       }
     }
     createToolbar=(type,symbol)=>{
      this.props.toolbar.deactivate() 
      this.type=type
      this.symbol=symbol
      this.props.toolbar.activate(this.Draw[this.type]);
    }
    componentDidMount(){
        window.addEventListener("message", this.looad,false)
        loadModules(["esri/symbols/PictureMarkerSymbol","esri/layers/GraphicsLayer","esri/symbols/SimpleMarkerSymbol","esri/toolbars/draw","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color","esri/request","esri/geometry/Polygon","esri/symbols/SimpleFillSymbol","esri/graphic"], options)
        .then(([PicSym,GraphicsLayer,SimpleMarkerSymbol,Draw,Polyline,SimpleLineSymbol,Color,request,Polygon,SimpleFillSymbol,Graphic]) => {
  
          this.DrawGraphicLayer = new GraphicsLayer()
     this.DrawGraphicLayer.on("mouse-down",(res)=>{
      if(this.DelShape){

        this.DrawGraphicLayer.remove(res.graphic) 
      }
   })
     this.SelectGraphicLayer = new GraphicsLayer()
          this.SimpleMarkerSymbol = new SimpleMarkerSymbol()
          this.Draw = Draw
          this.Polygon=Polygon;  
          this.Polyline=Polyline   
          this.request=request
          this.graphic = Graphic;
          
          this.PicSym = new PicSym({
            'angle': 0,
                 'xoffset': 0,
                 'yoffset': 0,
                 'type': 'esriPMS',
                 'url': logo,
                 'contentType': 'image/png',
                 'width': 20,
                 'height': 30
          }
            )
          this.SimpleFillSymbol = new SimpleFillSymbol();
          this.LineSimbol =new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
          new Color([0,255,0]), 10)
          this.DrawSimbol =new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
          new Color([0,0,0]), 4)
        ///////////////////////////
        var layerUrl = "http://webgis.eamana.gov.sa/arcgisnew/rest/services/MAPVIEWERSERVICE/MapServer/15";
         request({
          url: layerUrl,
          content: { f: "json" },
          handleAs: "json",
          callbackParamName: "callback"
        }).then(
          (response) =>{
            console.log(response.types[0].domains.MUNICIPALITY_NAME.codedValues)
          this.setState( { MunicipalityNames: response.types[0].domains.MUNICIPALITY_NAME.codedValues}) 
        }
      );
      var layerUrl = "http://webgis.eamana.gov.sa/arcgisnew/rest/services/MAPVIEWERSERVICE/MapServer/13";
      request({
       url: layerUrl,
       content: { f: "json" },
       handleAs: "json",
       callbackParamName: "callback"
     }).then(
       (response) =>{
        this.DistictDomin= response.fields[2].domain.codedValues 
        this.DistictDomin.forEach(e=>
          {this.DistictDominObject["n"+e.code]=e.name})
          console.log(this.DistictDominObject)
        }
      );

    });  
   
   console.log(this.props)
      }
   drawPol = (res)=>{
    this.pol = new this.Polygon(res.features[0].geometry); 
    this.SelectGraphicLayer.clear();
    this.SelectGraphicLayer.add(new this.graphic(this.pol,this.SimpleFillSymbol))
    this.props.map.setExtent(this.pol.getExtent())
   }
   
     onMunChange= (e)=>{
       debugger
      if(this.props.toolbar&&this.props.map&&this.f){
        debugger
        this.props.toolbar.on("draw-complete", (e)=>{
          this.DeleteDraw()//Comment this line to enable Multi Drawing
         // window.WorksData[this.type].push(e.geometry)
         window.WorksData.Shape= []
          window.WorksData.Shape.push(e.geometry)
          debugger
          if(e.geometry.rings){

            this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.SimpleFillSymbol))
           }else{
             this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.PicSym))
           }
         // this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.PicSym))
          this.props.toolbar.deactivate() 
        });
        this.props.map.addLayer(this.SelectGraphicLayer)
        this.props.map.addLayer(this.DrawGraphicLayer)
        this.f=false;
      }
      window.WorksData.MunicipalityName = this.state.MunicipalityNames.filter(ff=>ff.code==e)[0].name     
       window.WorksData.Municipality=e
      this.setState({
        DistictNames:[],
        StreetNum:[],
        StreetId:undefined,
        DistrictId:undefined,
        MunicipalityId:e      
      })
      DataQuery(15,
      [...queryOption(`MUNICIPALITY_NAME="${e}"`,true,[""])],(res)=>{
      this.drawPol(res)
      })
DataQuery(13,
  [...queryOption(`MUNICIPALITY_NAME="${e}"`,false,["DISTRICT_NAME"])],(res)=>{
    this.setState({DistictNames:res.features})
    console.log(res.features)
  })

   }

   onDistrictChange=(e)=>{
     this.setState({
       DistrictId:e,
       StreetNum:[],
       StreetId:undefined
      })
      window.WorksData.District=e
      window.WorksData.Districtname =this.DistictDominObject["n"+e]
      DataQuery(13,
        [...queryOption(`DISTRICT_NAME="${e}"`,true,["DISTRICT_NAME"])],(res)=>{
          this.drawPol(res)
        })
        
        DataQuery(6,
          [...queryOption(`DISTRICT_NAME="${e}"`,false,["STREET_FULLNAME","OBJECTID"])],(res)=>{
            this.setState({StreetNum:res.features})
            console.log(res.features)
          })
        }
        onStreetChange=(e)=>{
          window.WorksData.streetId=e
          window.WorksData.streetname = this.state.StreetNum.filter(ff=>ff.attributes.OBJECTID==e)[0].attributes.STREET_FULLNAME

          this.setState({
            StreetId:e
          })
          DataQuery(6,
            [...queryOption(`OBJECTID="${e}"`,true,[])],(res)=>{
              
              this.pol = new this.Polyline(res.features[0].geometry); 
              this.SelectGraphicLayer.clear();
              this.SelectGraphicLayer.add(new this.graphic(this.pol,this.LineSimbol))
              this.props.map.setExtent(this.pol.getExtent())
              
            })
          }
          
          
          StartDrawPoly=()=>{
          
          this.createToolbar("POLYGON",this.SimpleFillSymbol)
          }
          StartDrawPoint=()=>{
           
          this.createToolbar("POINT",this.PicSym)
          }
          DeleteDraw=()=>{
              window.WorksData.POINT=[];
              window.WorksData.FREEHAND_POLYGON=[];
              this.DrawGraphicLayer.clear()
            }
            save=()=>{
              this.isFromIframe = false;
              window.parent.postMessage(window.WorksData,"*")
              
            }
            looad=(e)=>{
              debugger
              if(this.props.toolbar&&this.props.map&&this.f){
                debugger
                this.props.toolbar.on("draw-complete", (e)=>{
                  this.DeleteDraw()//Comment this line to enable Multi Drawing
                 // window.WorksData[this.type].push(e.geometry)
                 window.WorksData.Shape= []
                  window.WorksData.Shape.push(e.geometry)
                  debugger
                  if(e.geometry.rings){
        
                    this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.SimpleFillSymbol))
                   }else{
                     this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.PicSym))
                   }
                 // this.DrawGraphicLayer.add(new this.graphic(e.geometry,this.PicSym))
                  this.props.toolbar.deactivate() 
                });
                this.props.map.addLayer(this.SelectGraphicLayer)
                this.props.map.addLayer(this.DrawGraphicLayer)
                this.f=false;
              }
              if(e.data)
              console.log(e.data)
              if(e.data.streetId && this.isFromIframe){ 
                //#region 
                // DataQuery(15,
                //   [...queryOption(`MUNICIPALITY_NAME="${e.data.Municipality}"`,true,[""])],(res)=>{
                //   this.drawPol(res)
                //   DataQuery(13,
                //     [...queryOption(`MUNICIPALITY_NAME="${e.data.Municipality}"`,false,["DISTRICT_NAME"])],(res)=>{
                //       this.setState({DistictNames:res.features})
                //       console.log(res.features)  
                //       DataQuery(13,
                //         [...queryOption(`DISTRICT_NAME="${e.data.District}"`,true,["DISTRICT_NAME"])],(res)=>{
                //           this.drawPol(res)
                //           DataQuery(6,
                //             [...queryOption(`DISTRICT_NAME="${e.data.District}"`,false,["STREET_FULLNAME","OBJECTID"])],(res)=>{
                //               this.setState({StreetNum:res.features})
                //               console.log(res.features)
                //             })
                //           })  
                          
                //         })
                        
                //       })
                //#endregion
                     
                
                DataQuery(6,
                        [...queryOption(`OBJECTID="${e.data.streetId}"`,true,[])],(res)=>{
                          
                          this.pol = new this.Polyline(res.features[0].geometry); 
                          this.SelectGraphicLayer.clear();
                          this.SelectGraphicLayer.add(new this.graphic(this.pol,this.LineSimbol))
                          this.props.map.setExtent(this.pol.getExtent())   
                          this.setState({
                            DISTRICT_NAME:e.data.Districtname,
                            STREET_NAME:e.data.streetname,
                            MUN_NAME:e.data.MunicipalityName,
                            disabled:true
                          })
                        debugger
                         e.data.Shape.forEach(n=>{
                         var ff = new this.Polygon(n);
                         if(n.rings){

                           this.DrawGraphicLayer.add(new this.graphic(ff,this.SimpleFillSymbol))
                          }else{
                            this.DrawGraphicLayer.add(new this.graphic(n,this.SimpleMarkerSymbol))

                          }
             
                          })
                          // e.data.Shape.forEach(n=>{
                          // })
                        })
                
              }  
            }

            StopDraw=()=>{
              this.props.toolbar.deactivate() 
            }
            DeleteLastDraw=()=>{
          
           var temp = this.DrawGraphicLayer.graphics[this.DrawGraphicLayer.graphics.length-1]
          
            try{
            if(temp.geometry.rings){
              window.WorksData.FREEHAND_POLYGON.pop()
            }else{
              window.WorksData.POINT.pop()
            }
          }catch(err) {
          }
           console.log(temp) 
           this.DrawGraphicLayer.remove(temp)
              }
              DeleteShape=()=>{
                this.DelShape=!this.DelShape
              }
          render() {
            return (
              <div>
{/* <Spin spinning={this.state.spinning} tip=" Loading">
  </Spin> */}
      <div className="content-section implementation layout-res" >
<MapComponent  ></MapComponent>


           <div className="mapSam">
           {this.state.disabled?<div className="show_if" style={{direction:'rtl'}}>
  <div >
    
         
         
  <table className="table">
       <tbody>
         <tr>
           <td>البلدية</td>
           <td> {this.state.MUN_NAME}</td>
         </tr>
         <tr>
           <td>الحى</td>
           <td>  {this.state.DISTRICT_NAME}</td>
         </tr>
         <tr>
           <td>الشارع</td>
           <td> {this.state.STREET_NAME}</td>
         </tr>
       </tbody>
     </table>
     <hr/>
         
         
        </div>
        </div>:<div>
               <div style={{display:'grid',margin:'5px'}}>
               <label className="label_cust">:البلديه</label>
          <Select
          hidden={this.state.disabled}
          autoFocus
          onChange={this.onMunChange}
          showSearch
          value={this.state.MunicipalityId}
          style={{marginRight:'11px'}}
          placeholder="اختر اسم البلديه"
          optionFilterProp="children"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          >
      {this.state.MunicipalityNames.map(e=><Option key={e.code} value={e.code}>{e.name}</Option>)}
  </Select>
  </div>
  <div style={{display:'grid',margin:'5px'}}>
  <label className="label_cust">:الحى </label>
          <Select
          hidden={this.state.disabled}
          autoFocus
          onChange={this.onDistrictChange}
          showSearch
          value={this.state.DistrictId}
          style={{marginRight:'11px'}}
          placeholder="اختر اسم الحى"
          optionFilterProp="children"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          >
      {this.state.DistictNames.map(e=><Option key={e.code} value={e.attributes.DISTRICT_NAME}>{this.DistictDominObject["n"+e.attributes.DISTRICT_NAME]}</Option>)}
  </Select>
  </div>

  <div style={{display:'grid',margin:'5px'}}>  
  <label className="label_cust"> :الشارع</label>
          <Select
          autoFocus
          hidden={this.state.disabled}
          onChange={this.onStreetChange}
          showSearch
          style={{marginRight:'11px'}}
          value={this.state.StreetId}
          placeholder="اختر اسم الشارع"
          optionFilterProp="children"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          >
      {this.state.StreetNum.filter(d=>d.attributes.STREET_FULLNAME).map(e=><Option key={e.code} value={e.attributes.OBJECTID}>{e.attributes.STREET_FULLNAME}</Option>)}
  </Select>
  </div>
<div className="buttonSam">

<Tooltip title="انقر على الخريطه لرسم مضلع ثم انقر مرتين بالفأره لإنهاء الرسم">
  <Button hidden={this.state.disabled} type="primary"   onClick={this.StartDrawPoly}>رسم مضلع</Button>
</Tooltip>
<Tooltip title="انقر على الخريطه في المكان المراد  لكي ترسم نقطة">
  <Button hidden={this.state.disabled}   type="primary" onClick={this.StartDrawPoint}>رسم نقطه</Button>
</Tooltip>
  {/* <Button disabled={this.state.disabled}   type="primary" onClick={this.DeleteDraw}>مسح الرسم</Button> */}
  {/* <Button disabled={this.state.disabled}   type="primary" onClick={this.StopDraw}>ايقاف الرسم</Button> */}
  {/* <Button disabled={this.state.disabled} type="danger"  onClick={this.DeleteLastDraw}>مسح اخر عنصر </Button> */}
  {/* <Button disabled={this.state.disabled} type="danger"  onClick={this.DeleteShape}>مسح عنصر </Button> */}
  <Button hidden={this.state.disabled}  style={{gridColumn:'1/3',backgroundColor: '#4CAF50'
    ,color: '#fff'}} type="success" onClick={this.save}>حفظ</Button>
  </div>
    
    </div>}
     
    </div>
    </div>
    </div>
    )
  }
}


export default  connect(mapStateToProps,mapDispatchToProps)(MapControlsComponent)
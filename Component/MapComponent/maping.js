export const mapStateToProps = state => {
    return {
        map:state.map  ,
        toolbar:state.toolbar
  };
}


  export const mapDispatchToProps = dispatch => {
    return {
        setmap: (e) => dispatch({type:'setMap',value:e}),
        setToolBar: (e) => dispatch({type:'setToolbar',value:e}),
       
  };}
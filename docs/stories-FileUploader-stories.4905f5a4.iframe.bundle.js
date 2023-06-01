"use strict";(self.webpackChunk_infinite_debugger_react_mui=self.webpackChunk_infinite_debugger_react_mui||[]).push([[2579],{"./node_modules/@babel/runtime/helpers/esm/objectDestructuringEmpty.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){function _objectDestructuringEmpty(obj){if(null==obj)throw new TypeError("Cannot destructure "+obj)}__webpack_require__.d(__webpack_exports__,{Z:function(){return _objectDestructuringEmpty}})},"./node_modules/@mui/icons-material/Close.js":function(__unused_webpack_module,exports,__webpack_require__){var _interopRequireDefault=__webpack_require__("./node_modules/@babel/runtime/helpers/interopRequireDefault.js");exports.Z=void 0;var _createSvgIcon=_interopRequireDefault(__webpack_require__("./node_modules/@mui/icons-material/utils/createSvgIcon.js")),_jsxRuntime=__webpack_require__("./node_modules/react/jsx-runtime.js"),_default=(0,_createSvgIcon.default)((0,_jsxRuntime.jsx)("path",{d:"M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"}),"Close");exports.Z=_default},"./node_modules/@mui/material/esm/Card/Card.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{Z:function(){return Card_Card}});var esm_extends=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react=__webpack_require__("./node_modules/react/index.js"),clsx_m=__webpack_require__("./node_modules/clsx/dist/clsx.m.js"),composeClasses=__webpack_require__("./node_modules/@mui/utils/esm/composeClasses/composeClasses.js"),styled=__webpack_require__("./node_modules/@mui/material/esm/styles/styled.js"),useThemeProps=__webpack_require__("./node_modules/@mui/material/esm/styles/useThemeProps.js"),Paper=__webpack_require__("./node_modules/@mui/material/esm/Paper/Paper.js"),generateUtilityClasses=__webpack_require__("./node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js"),generateUtilityClass=__webpack_require__("./node_modules/@mui/utils/esm/generateUtilityClass/generateUtilityClass.js");function getCardUtilityClass(slot){return(0,generateUtilityClass.Z)("MuiCard",slot)}(0,generateUtilityClasses.Z)("MuiCard",["root"]);var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const _excluded=["className","raised"],CardRoot=(0,styled.ZP)(Paper.Z,{name:"MuiCard",slot:"Root",overridesResolver:(props,styles)=>styles.root})((()=>({overflow:"hidden"})));var Card_Card=react.forwardRef((function Card(inProps,ref){const props=(0,useThemeProps.Z)({props:inProps,name:"MuiCard"}),{className:className,raised:raised=!1}=props,other=(0,objectWithoutPropertiesLoose.Z)(props,_excluded),ownerState=(0,esm_extends.Z)({},props,{raised:raised}),classes=(ownerState=>{const{classes:classes}=ownerState;return(0,composeClasses.Z)({root:["root"]},getCardUtilityClass,classes)})(ownerState);return(0,jsx_runtime.jsx)(CardRoot,(0,esm_extends.Z)({className:(0,clsx_m.Z)(classes.root,className),elevation:raised?8:void 0,ref:ref,ownerState:ownerState},other))}))},"./src/stories/FileUploader.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{AutoUpload:function(){return AutoUpload},AutoUploadWithErrors:function(){return AutoUploadWithErrors},Default:function(){return Default},Download:function(){return Download},WithFieldErrorMessage:function(){return WithFieldErrorMessage},__namedExportsOrder:function(){return __namedExportsOrder}});var _Default$parameters,_Default$parameters2,_Default$parameters2$,_WithFieldErrorMessag,_WithFieldErrorMessag2,_WithFieldErrorMessag3,_AutoUpload$parameter,_AutoUpload$parameter2,_AutoUpload$parameter3,_AutoUploadWithErrors,_AutoUploadWithErrors2,_AutoUploadWithErrors3,_Download$parameters,_Download$parameters2,_Download$parameters3,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectDestructuringEmpty_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectDestructuringEmpty.js"),D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),_mui_material_Container__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@mui/material/esm/Container/Container.js"),_components_FileUploader__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/components/FileUploader.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/react/jsx-runtime.js");__webpack_exports__.default={title:"Components/File Uploader",component:_components_FileUploader__WEBPACK_IMPORTED_MODULE_0__.Z};var Template=function Template(props){return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_mui_material_Container__WEBPACK_IMPORTED_MODULE_2__.Z,{maxWidth:"lg",sx:{p:3},children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_FileUploader__WEBPACK_IMPORTED_MODULE_0__.Z,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},props))})},upload=function upload(file,_ref){var onComplete=_ref.onComplete,onProgress=_ref.onProgress,onSuccess=_ref.onSuccess,countDown=1e4,interval=setInterval((function(){onProgress((1e4-(countDown-=100))/1e4*100),countDown<=0&&(clearInterval(interval),onSuccess({}),onComplete())}),100);return{cancel:function cancel(){clearInterval(interval),console.log("Cancelled File Upload")}}},Default=Template.bind({}),WithFieldErrorMessage=Template.bind({});WithFieldErrorMessage.args={error:!0,helperText:"This is an error message"};var AutoUpload=Template.bind({});AutoUpload.args={upload:upload};var AutoUploadWithErrors=Template.bind({});AutoUploadWithErrors.args={upload:function uploadWithErrors(file,_ref2){var onComplete=_ref2.onComplete,onError=_ref2.onError,onProgress=_ref2.onProgress,countDown=1e4,errorStage=Math.floor(1e4*Math.random()),interval=setInterval((function(){onProgress((1e4-(countDown-=100))/1e4*100),countDown<=errorStage&&(clearInterval(interval),onError(new Error("Failed to upload")),onComplete())}),100);return{cancel:function cancel(){clearInterval(interval),console.log("Cancelled File Upload With Errors")}}}};var Download=Template.bind({});Download.args={upload:upload,download:function download(_ref3,_ref4){(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectDestructuringEmpty_js__WEBPACK_IMPORTED_MODULE_4__.Z)(_ref3);var onComplete=_ref4.onComplete,onError=_ref4.onError,onProgress=_ref4.onProgress,countDown=1e4,errorStage=Math.floor(1e4*Math.random()),interval=setInterval((function(){onProgress((1e4-(countDown-=100))/1e4*100),countDown<=errorStage&&(clearInterval(interval),onError(new Error("Failed to download")),onComplete())}),100);return{cancel:function cancel(){clearInterval(interval),console.log("Cancelled File Download")}}}},Default.parameters=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},Default.parameters),{},{docs:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},null===(_Default$parameters=Default.parameters)||void 0===_Default$parameters?void 0:_Default$parameters.docs),{},{source:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({originalSource:'props => <Container maxWidth="lg" sx={{\n  p: 3\n}}>\r\n    <FileUploader {...props} />\r\n  </Container>'},null===(_Default$parameters2=Default.parameters)||void 0===_Default$parameters2||null===(_Default$parameters2$=_Default$parameters2.docs)||void 0===_Default$parameters2$?void 0:_Default$parameters2$.source)})}),WithFieldErrorMessage.parameters=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},WithFieldErrorMessage.parameters),{},{docs:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},null===(_WithFieldErrorMessag=WithFieldErrorMessage.parameters)||void 0===_WithFieldErrorMessag?void 0:_WithFieldErrorMessag.docs),{},{source:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({originalSource:'props => <Container maxWidth="lg" sx={{\n  p: 3\n}}>\r\n    <FileUploader {...props} />\r\n  </Container>'},null===(_WithFieldErrorMessag2=WithFieldErrorMessage.parameters)||void 0===_WithFieldErrorMessag2||null===(_WithFieldErrorMessag3=_WithFieldErrorMessag2.docs)||void 0===_WithFieldErrorMessag3?void 0:_WithFieldErrorMessag3.source)})}),AutoUpload.parameters=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},AutoUpload.parameters),{},{docs:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},null===(_AutoUpload$parameter=AutoUpload.parameters)||void 0===_AutoUpload$parameter?void 0:_AutoUpload$parameter.docs),{},{source:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({originalSource:'props => <Container maxWidth="lg" sx={{\n  p: 3\n}}>\r\n    <FileUploader {...props} />\r\n  </Container>'},null===(_AutoUpload$parameter2=AutoUpload.parameters)||void 0===_AutoUpload$parameter2||null===(_AutoUpload$parameter3=_AutoUpload$parameter2.docs)||void 0===_AutoUpload$parameter3?void 0:_AutoUpload$parameter3.source)})}),AutoUploadWithErrors.parameters=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},AutoUploadWithErrors.parameters),{},{docs:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},null===(_AutoUploadWithErrors=AutoUploadWithErrors.parameters)||void 0===_AutoUploadWithErrors?void 0:_AutoUploadWithErrors.docs),{},{source:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({originalSource:'props => <Container maxWidth="lg" sx={{\n  p: 3\n}}>\r\n    <FileUploader {...props} />\r\n  </Container>'},null===(_AutoUploadWithErrors2=AutoUploadWithErrors.parameters)||void 0===_AutoUploadWithErrors2||null===(_AutoUploadWithErrors3=_AutoUploadWithErrors2.docs)||void 0===_AutoUploadWithErrors3?void 0:_AutoUploadWithErrors3.source)})}),Download.parameters=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},Download.parameters),{},{docs:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},null===(_Download$parameters=Download.parameters)||void 0===_Download$parameters?void 0:_Download$parameters.docs),{},{source:(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({originalSource:'props => <Container maxWidth="lg" sx={{\n  p: 3\n}}>\r\n    <FileUploader {...props} />\r\n  </Container>'},null===(_Download$parameters2=Download.parameters)||void 0===_Download$parameters2||null===(_Download$parameters3=_Download$parameters2.docs)||void 0===_Download$parameters3?void 0:_Download$parameters3.source)})});var __namedExportsOrder=["Default","WithFieldErrorMessage","AutoUpload","AutoUploadWithErrors","Download"]},"./src/components/FileUploader.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{Z:function(){return components_FileUploader}});var toConsumableArray=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js"),slicedToArray=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/slicedToArray.js"),bytes=__webpack_require__("./node_modules/@infinite-debugger/rmk-utils/bytes.js"),Close=__webpack_require__("./node_modules/@mui/icons-material/Close.js"),CloudDownload=__webpack_require__("./node_modules/@mui/icons-material/CloudDownload.js"),CloudUpload=__webpack_require__("./node_modules/@mui/icons-material/CloudUpload.js"),Delete=__webpack_require__("./node_modules/@mui/icons-material/Delete.js"),Refresh=__webpack_require__("./node_modules/@mui/icons-material/Refresh.js"),Card=__webpack_require__("./node_modules/@mui/material/esm/Card/Card.js"),IconButton=__webpack_require__("./node_modules/@mui/material/esm/IconButton/IconButton.js"),Box=__webpack_require__("./node_modules/@mui/material/esm/Box/Box.js"),Button=__webpack_require__("./node_modules/@mui/material/esm/Button/Button.js"),Divider=__webpack_require__("./node_modules/@mui/material/esm/Divider/Divider.js"),FormControl=__webpack_require__("./node_modules/@mui/material/esm/FormControl/FormControl.js"),FormHelperText=__webpack_require__("./node_modules/@mui/material/esm/FormHelperText/FormHelperText.js"),Grid=__webpack_require__("./node_modules/@mui/material/esm/Grid/Grid.js"),LinearProgress=__webpack_require__("./node_modules/@mui/material/esm/LinearProgress/LinearProgress.js"),List=__webpack_require__("./node_modules/@mui/material/esm/List/List.js"),ListItem=__webpack_require__("./node_modules/@mui/material/esm/ListItem/ListItem.js"),ListItemAvatar=__webpack_require__("./node_modules/@mui/material/esm/ListItemAvatar/ListItemAvatar.js"),ListItemText=__webpack_require__("./node_modules/@mui/material/esm/ListItemText/ListItemText.js"),useTheme=__webpack_require__("./node_modules/@mui/material/styles/useTheme.js"),Tooltip=__webpack_require__("./node_modules/@mui/material/esm/Tooltip/Tooltip.js"),Typography=__webpack_require__("./node_modules/@mui/material/esm/Typography/Typography.js"),colorManipulator=__webpack_require__("./node_modules/@mui/system/colorManipulator.js"),react=__webpack_require__("./node_modules/react/index.js"),Files=__webpack_require__("./src/hooks/Files.ts"),page=__webpack_require__("./src/utils/page.ts"),objectSpread2=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),objectWithoutProperties=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),generateUtilityClass=__webpack_require__("./node_modules/@mui/utils/esm/generateUtilityClass/generateUtilityClass.js"),generateUtilityClasses=__webpack_require__("./node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js"),useThemeProps=__webpack_require__("./node_modules/@mui/material/esm/styles/useThemeProps.js"),composeClasses=__webpack_require__("./node_modules/@mui/utils/esm/composeClasses/composeClasses.js"),clsx_m=__webpack_require__("./node_modules/clsx/dist/clsx.m.js"),react_file_icon_esm=__webpack_require__("./node_modules/react-file-icon/dist/react-file-icon.esm.js"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js"),_excluded=["className","fileName","sx"];function getFileIconUtilityClass(slot){return(0,generateUtilityClass.Z)("MuiFileIcon",slot)}(0,generateUtilityClasses.Z)("MuiFileIcon",["root"]);var slots={root:["root"]},FileIcon=(0,react.forwardRef)((function FileIcon(inProps,ref){var props=(0,useThemeProps.Z)({props:inProps,name:"MuiFileIcon"}),className=props.className,fileName=props.fileName,sx=props.sx,rest=(0,objectWithoutProperties.Z)(props,_excluded),classes=(0,composeClasses.Z)(slots,getFileIconUtilityClass,function(){if(className)return{root:className}}()),fileExtension=(0,react.useMemo)((function(){var match=/\.([a-z]+)$/gi.exec(fileName);return match?match[1]:""}),[fileName]);return(0,jsx_runtime.jsx)(Box.Z,(0,objectSpread2.Z)((0,objectSpread2.Z)({ref:ref},rest),{},{className:(0,clsx_m.Z)(classes.root),sx:(0,objectSpread2.Z)((0,objectSpread2.Z)({},sx),{},{display:"flex"}),children:(0,jsx_runtime.jsx)(react_file_icon_esm.a,(0,objectSpread2.Z)({extension:fileExtension.toUpperCase()},function(){if(fileExtension)return react_file_icon_esm.j[fileExtension]}()))}))})),components_FileIcon=FileIcon;try{getFileIconUtilityClass.displayName="getFileIconUtilityClass",getFileIconUtilityClass.__docgenInfo={description:"",displayName:"getFileIconUtilityClass",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/FileIcon.tsx#getFileIconUtilityClass"]={docgenInfo:getFileIconUtilityClass.__docgenInfo,name:"getFileIconUtilityClass",path:"src/components/FileIcon.tsx#getFileIconUtilityClass"})}catch(__react_docgen_typescript_loader_error){}try{FileIcon.displayName="FileIcon",FileIcon.__docgenInfo={description:"",displayName:"FileIcon",props:{fileName:{defaultValue:null,description:"",name:"fileName",required:!0,type:{name:"string"}},sx:{defaultValue:null,description:"The system prop that allows defining system overrides as well as additional CSS styles.",name:"sx",required:!1,type:{name:"SxProps<Theme>"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/FileIcon.tsx#FileIcon"]={docgenInfo:FileIcon.__docgenInfo,name:"FileIcon",path:"src/components/FileIcon.tsx#FileIcon"})}catch(__react_docgen_typescript_loader_error){}var FileUploader=(0,react.forwardRef)((function FileUploader(_ref,ref){var helperText=_ref.helperText,error=_ref.error,onChange=_ref.onChange,name=_ref.name,id=_ref.id,value=_ref.value,upload=_ref.upload,download=_ref.download,palette=(0,useTheme.Z)().palette,_useState=(0,react.useState)(null),_useState2=(0,slicedToArray.Z)(_useState,2),fileListContainer=_useState2[0],setFileListContainer=_useState2[1],_useState3=(0,react.useState)(null),_useState4=(0,slicedToArray.Z)(_useState3,2),fileField=_useState4[0],setFileField=_useState4[1],_useFileUpload=(0,Files.F)({fileField:fileField,upload:upload,download:download,name:name,id:id,value:value,onChange:onChange,convertFilesToBase64:!1}),files=_useFileUpload.files,setFiles=_useFileUpload.setFiles,duplicateFileSelections=_useFileUpload.duplicateFileSelections,removeFile=function removeFile(index){files.splice(index,1),setFiles((0,toConsumableArray.Z)(files))};return(0,react.useEffect)((function(){fileListContainer&&duplicateFileSelections.length>0&&(0,toConsumableArray.Z)(fileListContainer.querySelectorAll(".file-uploader-file-list-item")).filter((function(_,index){return duplicateFileSelections.includes(index)})).forEach((function(fileLIstItem){return(0,page.N)(fileLIstItem)}))}),[duplicateFileSelections,fileListContainer]),(0,jsx_runtime.jsxs)(FormControl.Z,{ref:ref,fullWidth:!0,error:error,children:[(0,jsx_runtime.jsx)("input",{type:"file",ref:function ref(fileField){setFileField(fileField)},multiple:!0,style:{display:"none"}}),(0,jsx_runtime.jsxs)(Grid.ZP,{container:!0,columnSpacing:3,children:[(0,jsx_runtime.jsxs)(Grid.ZP,{item:!0,xs:files.length<=0,sx:{width:files.length>0?320:void 0},children:[(0,jsx_runtime.jsx)(Card.Z,{sx:{bgcolor:(0,colorManipulator.Fq)(palette.text.primary,.1),cursor:"pointer",borderWidth:2,borderStyle:"dashed"},onClick:function onClick(){null==fileField||fileField.click()},children:(0,jsx_runtime.jsxs)(Box.Z,{sx:{width:"100%",minWidth:220,height:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:[(0,jsx_runtime.jsx)(CloudUpload.Z,{sx:{fontSize:80,display:"block",color:(0,colorManipulator.Fq)(palette.text.primary,.2)}}),(0,jsx_runtime.jsx)(Button.Z,{variant:"contained",color:"success",sx:{mb:1},children:"Upload File"}),(0,jsx_runtime.jsx)(Typography.Z,{variant:"body2",sx:{color:(0,colorManipulator.Fq)(palette.text.primary,.2),fontWeight:"bold"},children:"20MB Maximum file size"})]})}),helperText&&(0,jsx_runtime.jsx)(FormHelperText.Z,{children:helperText})]}),files.length>0?(0,jsx_runtime.jsxs)(Grid.ZP,{item:!0,xs:!0,children:[(0,jsx_runtime.jsxs)(Grid.ZP,{container:!0,alignItems:"center",children:[(0,jsx_runtime.jsx)(Grid.ZP,{item:!0,xs:!0,children:(0,jsx_runtime.jsxs)(Typography.Z,{sx:{fontWeight:"bold"},children:[files.length," file",1===files.length?null:"s"]})}),(0,jsx_runtime.jsx)(Grid.ZP,{item:!0,children:(0,jsx_runtime.jsx)(Typography.Z,{sx:{color:palette.success.main,cursor:"pointer",fontSize:14},children:"Download All"})})]}),(0,jsx_runtime.jsx)(List.Z,{ref:function ref(fileListContainer){setFileListContainer(fileListContainer)},className:"file-uploader-file-list",sx:{width:"100%"},children:files.map((function(_ref2,index){var uploading=_ref2.uploading,uploadProgress=_ref2.uploadProgress,uploadError=_ref2.uploadError,cancelUpload=_ref2.cancelUpload,retryUpload=_ref2.retryUpload,download=_ref2.download,downloading=_ref2.downloading,downloadProgress=_ref2.downloadProgress,downloadError=_ref2.downloadError,cancelDownload=_ref2.cancelDownload,retryDownload=_ref2.retryDownload,name=_ref2.name,size=_ref2.size;return(0,jsx_runtime.jsxs)(react.Fragment,{children:[0===index?null:(0,jsx_runtime.jsx)(Divider.Z,{}),(0,jsx_runtime.jsxs)(ListItem.ZP,{className:"file-uploader-file-list-item",sx:{px:0,py:.5,"&:hover":{backgroundColor:(0,colorManipulator.Fq)(palette.primary.main,.1)},gap:2},children:[(0,jsx_runtime.jsx)(ListItemAvatar.Z,{sx:{minWidth:40},children:(0,jsx_runtime.jsx)(components_FileIcon,{fileName:name,sx:{svg:{width:40}}})}),(0,jsx_runtime.jsx)(ListItemText.Z,{primary:name,primaryTypographyProps:{noWrap:!0},secondary:(0,bytes.formatBytes)(size),secondaryTypographyProps:{sx:{fontSize:12}},sx:{flex:1,minWidth:0,wordBreak:"break-all"}}),(0,jsx_runtime.jsxs)(Box.Z,{sx:{display:"flex"},children:[!download||uploading||uploadError||downloading||downloadError?null:(0,jsx_runtime.jsx)(Tooltip.Z,{title:"Dowload",children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){return download()},children:(0,jsx_runtime.jsx)(CloudDownload.Z,{})})}),uploading||uploadError||downloading||downloadError?null:(0,jsx_runtime.jsx)(Tooltip.Z,{title:"Delete",children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){removeFile(index),cancelUpload&&cancelUpload(),cancelDownload&&cancelDownload()},children:(0,jsx_runtime.jsx)(Delete.Z,{})})}),uploadError&&retryUpload?(0,jsx_runtime.jsx)(Tooltip.Z,{title:uploadError,children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){return retryUpload()},children:(0,jsx_runtime.jsx)(Refresh.Z,{})})}):null,uploading||uploadError?(0,jsx_runtime.jsx)(Tooltip.Z,{title:"Cancel Upload",children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){removeFile(index),cancelUpload&&cancelUpload()},children:(0,jsx_runtime.jsx)(Close.Z,{})})}):null,downloadError&&retryDownload?(0,jsx_runtime.jsx)(Tooltip.Z,{title:downloadError,children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){return retryDownload()},children:(0,jsx_runtime.jsx)(Refresh.Z,{})})}):null,downloading||downloadError?(0,jsx_runtime.jsx)(Tooltip.Z,{title:"Cancel Download",children:(0,jsx_runtime.jsx)(IconButton.Z,{onClick:function onClick(){cancelDownload&&cancelDownload()},children:(0,jsx_runtime.jsx)(Close.Z,{})})}):null]})]}),uploadProgress&&(uploading||uploadError)?(0,jsx_runtime.jsx)(LinearProgress.Z,{value:uploadProgress,variant:"determinate",color:uploadError?"error":"info"}):null,downloadProgress&&(downloading||downloadError)?(0,jsx_runtime.jsx)(LinearProgress.Z,{value:downloadProgress,variant:"determinate",color:downloadError?"error":"info"}):null]},index)}))})]}):null]})]})})),components_FileUploader=FileUploader;try{FileUploader.displayName="FileUploader",FileUploader.__docgenInfo={description:"",displayName:"FileUploader",props:{value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"FileContainer[]"}},upload:{defaultValue:null,description:"",name:"upload",required:!1,type:{name:"FileUploadFunction"}},download:{defaultValue:null,description:"",name:"download",required:!1,type:{name:"FileDownloadFunction"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/FileUploader.tsx#FileUploader"]={docgenInfo:FileUploader.__docgenInfo,name:"FileUploader",path:"src/components/FileUploader.tsx#FileUploader"})}catch(__react_docgen_typescript_loader_error){}},"./src/hooks/Files.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{F:function(){return useFileUpload}});var D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/regeneratorRuntime.js"),D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js"),D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js"),D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectSpread2.js"),D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/slicedToArray.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),uniqid__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/uniqid/index.js"),uniqid__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(uniqid__WEBPACK_IMPORTED_MODULE_1__),useFileUpload=function useFileUpload(_ref){var fileField=_ref.fileField,upload=_ref.upload,download=_ref.download,name=_ref.name,id=_ref.id,value=_ref.value,onChange=_ref.onChange,_ref$convertFilesToBa=_ref.convertFilesToBase64,convertFilesToBase64=void 0===_ref$convertFilesToBa||_ref$convertFilesToBa,_useState=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(value||[]),_useState2=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__.Z)(_useState,2),files=_useState2[0],setFiles=_useState2[1],_useState3=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),_useState4=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__.Z)(_useState3,2),duplicateFileSelections=_useState4[0],setDuplicateFileSelections=_useState4[1],isInitialMount=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(!0),onChangeRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(onChange),downloadRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(download),uploadRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(upload),filesRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(files);(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((function(){isInitialMount.current=!1,onChangeRef.current=onChange,downloadRef.current=download,uploadRef.current=upload,filesRef.current=files}),[download,files,onChange,upload]);var getLoadableFilesRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)((function(files){return files.map((function(file){var loadableFile=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_3__.Z)({},file),originalFile=file.originalFile,id=file.id,extraParams=file.extraParams,upload=uploadRef.current;if(upload){var retryFileUpload=function retryFileUpload(){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref2){return _ref2.originalFile===originalFile}));return stateFile?(stateFile.uploadError="",delete stateFile.retryUpload,Object.assign(stateFile,uploadFile()),(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},uploadFile=function uploadFile(){var cancel=upload(originalFile,{onProgress:function onProgress(progress){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref3){return _ref3.originalFile===originalFile}));return stateFile?(stateFile.uploadProgress=progress,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onError:function onError(err){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref4){return _ref4.originalFile===originalFile}));return stateFile?(stateFile.uploadError=err.message,stateFile.retryUpload=retryFileUpload,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onSuccess:function onSuccess(payload){payload.id&&setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref5){return _ref5.originalFile===originalFile}));return stateFile?(stateFile.id=payload.id,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onComplete:function onComplete(){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref6){return _ref6.originalFile===originalFile}));return stateFile?(stateFile.uploading=!1,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))}}).cancel;setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref7){return _ref7.originalFile===originalFile}));return stateFile?(stateFile.uploading=!0,stateFile.cancelUpload=function(){cancel(),setFiles((function(prevFiles){return prevFiles.includes(stateFile)?(prevFiles.splice(prevFiles.indexOf(stateFile),1),(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))};loadableFile.upload=uploadFile}var download=downloadRef.current;if(download){var retryFileDownload=function retryFileDownload(){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref8){return _ref8.id===id}));return stateFile?(stateFile.downloadError="",delete stateFile.retryDownload,Object.assign(stateFile,downloadFile()),(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},downloadFile=function downloadFile(){var cancel=download({id:id,extraParams:extraParams},{onProgress:function onProgress(progress){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref9){return _ref9.id===id}));return stateFile?(stateFile.downloadProgress=progress,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onError:function onError(err){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref10){return _ref10.id===id}));return stateFile?(stateFile.downloadError=err.message,stateFile.retryDownload=retryFileDownload,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onSuccess:function onSuccess(payload){payload.id&&setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref11){return _ref11.id===id}));return stateFile?(stateFile.id=payload.id,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},onComplete:function onComplete(){setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref12){return _ref12.id===id}));return stateFile?(stateFile.downloading=!1,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))}}).cancel;setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref13){return _ref13.id===id}));return stateFile?(stateFile.downloading=!0,stateFile.cancelDownload=function(){cancel(),setFiles((function(prevFiles){var stateFile=prevFiles.find((function(_ref14){return _ref14.id===id}));return stateFile?(stateFile.downloading=!1,delete stateFile.downloadError,delete stateFile.downloadProgress,(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))},(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(prevFiles)):prevFiles}))};loadableFile.download=downloadFile}return loadableFile}))}));return(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((function(){if(fileField){var changeEventCallback=function(){var _ref15=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_5__.Z)((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_6__.Z)().mark((function _callee(){var _reduce,_reduce2,selectedFiles,_duplicateFileSelections,newFiles,newLoadableFiles,nextFiles;return(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_6__.Z)().wrap((function _callee$(_context){for(;;)switch(_context.prev=_context.next){case 0:if(!(fileField.files&&fileField.files.length>0)){_context.next=11;break}return _reduce=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(fileField.files).reduce((function(accumulator,file){var existingFile=filesRef.current.find((function(_ref16){var name=_ref16.name,size=_ref16.size;return file.name===name&&file.size===size}));return existingFile?accumulator[1].push(filesRef.current.indexOf(existingFile)):accumulator[0].push(file),accumulator}),[[],[]]),_reduce2=(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__.Z)(_reduce,2),selectedFiles=_reduce2[0],_duplicateFileSelections=_reduce2[1],_context.next=4,Promise.all(selectedFiles.map((function(file){var name=file.name,size=file.size;return convertFilesToBase64?new Promise((function(resolve,reject){var reader=new FileReader;reader.readAsDataURL(file),reader.onload=function(){return resolve({base64:reader.result,originalFile:file,name:name,size:size})},reader.onerror=function(error){return reject(error)}})):{originalFile:file,id:uniqid__WEBPACK_IMPORTED_MODULE_1___default()(),name:name,size:size}})));case 4:newFiles=_context.sent,fileField.value="",newLoadableFiles=getLoadableFilesRef.current(newFiles),nextFiles=[].concat((0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(filesRef.current),(0,D_sandbox_rmkasendwa_com_rmk_react_mui_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__.Z)(newLoadableFiles)),setFiles(nextFiles),setDuplicateFileSelections(_duplicateFileSelections),newLoadableFiles.forEach((function(_ref17){var upload=_ref17.upload;upload&&upload()}));case 11:case"end":return _context.stop()}}),_callee)})));return function changeEventCallback(){return _ref15.apply(this,arguments)}}();return fileField.addEventListener("change",changeEventCallback),function(){fileField.removeEventListener("change",changeEventCallback)}}}),[convertFilesToBase64,fileField]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((function(){setFiles((function(prevFiles){return value&&JSON.stringify(value.map((function(_ref18){return{id:_ref18.id,name:_ref18.name,size:_ref18.size}})))!==JSON.stringify(prevFiles.map((function(_ref19){return{id:_ref19.id,name:_ref19.name,size:_ref19.size}})))?value:prevFiles}))}),[value]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((function(){if(onChangeRef.current&&!isInitialMount.current){var event=new Event("change",{bubbles:!0});Object.defineProperty(event,"target",{writable:!1,value:{id:id,name:name,value:files.map((function(_ref20){return{id:_ref20.id,base64:_ref20.base64,name:_ref20.name,size:_ref20.size,originalFile:_ref20.originalFile,extraParams:_ref20.extraParams}}))}}),onChangeRef.current(event)}}),[files,id,name]),{files:files,duplicateFileSelections:duplicateFileSelections,setFiles:setFiles}}},"./src/utils/page.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{N:function(){return flickerElement}});var flickerElement=function flickerElement(element){element.classList.add("flicker"),setTimeout((function(){return element.classList.remove("flicker")}),1e3)}}}]);
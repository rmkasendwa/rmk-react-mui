import{j as n}from"./jsx-runtime-DoEZbXM1.js";import{d as j}from"./index-BeW276Wi.js";import{r as s}from"./index-DyFhm7NF.js";import{I as x}from"./InfiniteScrollBox-lWcthrSh.js";import{B as b}from"./Button-UL46O9fT.js";import{T as I}from"./Typography-CgOnAQvQ.js";import"./jsx-runtime-Bw5QeaCk.js";import"./defaultTheme-p7chgXuo.js";import"./index-Bf2qc8Rt.js";import"./useThemeProps-Bd4KMueQ.js";import"./Box-Cv6nAA57.js";import"./extendSxProp-DAcN17IG.js";import"./DefaultPropsProvider-egKEaGQO.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";import"./TransitionGroupContext-DDx4AGHL.js";import"./ButtonBase-DE0LPmTn.js";import"./useForkRef-CH5D7H94.js";import"./CircularProgress-D8lStaeO.js";import"./index-DwZPt9kI.js";const J={title:"Components/Infinite Scroll Box",component:x},W=new j.LoremIpsum,B=({sx:m,...p})=>{const t=s.useMemo(()=>Array.from({length:1e3}).map((r,a)=>{const e=`${a+1}. ${W.generateWords(4)}`;return n.jsx(b,{color:"inherit",fullWidth:!0,sx:{p:0,justifyContent:"start"},children:n.jsx(I,{noWrap:!0,sx:{lineHeight:"50px",px:3},children:e})},a)}),[]),[u,d]=s.useState(()=>t.splice(0,100));return n.jsx(x,{...p,load:()=>{d(r=>[...r,...t.splice(0,100)])},sx:{position:"absolute",width:"100%",height:"100%",overflowY:"auto",...m},children:u})},v=({sx:m,...p})=>{const t=s.useMemo(()=>Array.from({length:1e3}).map((e,o)=>({label:`${o+1}. ${W.generateWords(4)}`,index:o})),[]),[u,d]=s.useState(()=>t.splice(0,100)),[r,a]=s.useState(0);return n.jsx(x,{...p,focusedElementIndex:r,load:()=>{d(e=>[...e,...t.splice(0,100)])},dataElements:u.map(({label:e,index:o})=>{const c=r===o;return n.jsx(b,{color:c?"primary":"inherit",variant:c?"contained":"text",fullWidth:!0,sx:{p:0,justifyContent:"start"},children:n.jsx(I,{noWrap:!0,sx:{lineHeight:"50px",px:3},children:e})},o)}),paging:!0,dataElementLength:50,onChangeFocusedDataElement:e=>{a(e)},sx:{position:"absolute",width:"100%",height:"100%",overflowY:"auto",...m}})},l=B.bind({}),i=v.bind({});var h,f,g;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`({
  sx,
  ...rest
}) => {
  const defaultElements = useMemo(() => {
    return Array.from({
      length: 1000
    }).map((_, index) => {
      const label = \`\${index + 1}. \${lorem.generateWords(4)}\`;
      return <Button key={index} color="inherit" fullWidth sx={{
        p: 0,
        justifyContent: 'start'
      }}>
          <Typography noWrap sx={{
          lineHeight: '50px',
          px: 3
        }}>
            {label}
          </Typography>
        </Button>;
    });
  }, []);
  const [elements, setElements] = useState(() => {
    return defaultElements.splice(0, 100);
  });
  return <InfiniteScrollBox {...rest} load={() => {
    setElements(prevElements => {
      return [...prevElements, ...defaultElements.splice(0, 100)];
    });
  }} sx={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    ...sx
  }}>
      {elements}
    </InfiniteScrollBox>;
}`,...(g=(f=l.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var E,y,S;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`({
  sx,
  ...rest
}) => {
  const dataSet = useMemo(() => {
    return Array.from({
      length: 1000
    }).map((_, index) => {
      const label = \`\${index + 1}. \${lorem.generateWords(4)}\`;
      return {
        label,
        index
      };
    });
  }, []);
  const [elements, setElements] = useState(() => {
    return dataSet.splice(0, 100);
  });
  const [focusedElementIndex, setFocusedElementIndex] = useState(0);
  return <InfiniteScrollBox {...rest} {...{
    focusedElementIndex
  }} load={() => {
    setElements(prevElements => {
      return [...prevElements, ...dataSet.splice(0, 100)];
    });
  }} dataElements={elements.map(({
    label,
    index
  }) => {
    const isFocused = focusedElementIndex === index;
    return <Button key={index} color={isFocused ? 'primary' : 'inherit'} variant={isFocused ? 'contained' : 'text'} fullWidth sx={{
      p: 0,
      justifyContent: 'start'
    }}>
            <Typography noWrap sx={{
        lineHeight: '50px',
        px: 3
      }}>
              {label}
            </Typography>
          </Button>;
  })} paging dataElementLength={50} onChangeFocusedDataElement={index => {
    setFocusedElementIndex(index);
  }} sx={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    ...sx
  }} />;
}`,...(S=(y=i.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};const K=["Default","WithPaging"];export{l as Default,i as WithPaging,K as __namedExportsOrder,J as default};

const image=(name,alt,caption,width=1122,height=1402,fileName=name)=>({
  id:`cool-harvest-${name}`,
  image:`/work/cool-harvest-${fileName}-1360.webp`,
  srcSet:`/work/cool-harvest-${fileName}-320.webp 320w, /work/cool-harvest-${fileName}-640.webp 640w, /work/cool-harvest-${fileName}-960.webp 960w, /work/cool-harvest-${fileName}-1360.webp 1360w`,
  width,
  height,
  alt,
  caption
});

export const additionalProjects=[{
  slug:'cool-harvest-farms',
  name:'Cool Harvest Farms',
  category:'packaging',
  type:'Packaging design',
  descriptor:'A connected food range designed to feel local, clear and ready to trust.',
  status:'Recent portfolio work',
  image:'/work/cool-harvest-red-oil-2l-1360.webp',
  intro:'A connected food range designed to feel local, clear and ready to trust.',
  secondaryImage:image('chin-chin','Cool Harvest Farms Chin Chin jar mockup','Cool Harvest Farms · Chin Chin jar'),
  gallery:[
    image('honey-beans','Cool Harvest Farms Honey Beans (Ewa Oloyin) pack mockup','Cool Harvest Farms · Honey Beans (Ewa Oloyin)',1122,1402,'red-oil-2l'),
    image('red-oil-1l','Cool Harvest Farms Red Oil 1 litre bottle mockup','Cool Harvest Farms · Red Oil 1 litre bottle'),
    image('chin-chin','Cool Harvest Farms Chin Chin jar mockup','Cool Harvest Farms · Chin Chin jar'),
    image('garri-ijebu','Cool Harvest Farms Garri Ijebu pouch mockup','Cool Harvest Farms · Garri Ijebu pouch',1254,1254),
    image('groundnut','Cool Harvest Farms Groundnut bottle mockup','Cool Harvest Farms · Groundnut bottle'),
    image('cray-fish','Cool Harvest Farms Cray Fish jar mockup','Cool Harvest Farms · Cray Fish jar',1086,1448),
    image('plantain-chips','Cool Harvest Farms Plantain Chips pouch mockup','Cool Harvest Farms · Plantain Chips pouch',1086,1448),
    image('hot-pepper','Cool Harvest Farms Hot Pepper jar mockup','Cool Harvest Farms · Hot Pepper jar',1086,1448),
    image('beans','Cool Harvest Farms Beans pouch mockup','Cool Harvest Farms · Beans pouch',1086,1448)
  ],
  resources:[],
  story:[
    ['Context','Cool Harvest Farms needed a food range that could feel familiar on the shelf while giving every product a clear place within one growing brand.'],
    ['Visual direction','The system uses a calm farm led identity, warm product photography and strong product names so shoppers can understand the range at a glance.'],
    ['Design decisions','Bottle, pouch and jar formats share the same brand structure while colour, product imagery and pack size help each item stay easy to identify.'],
    ['Applications','The supplied presentations cover Honey Beans (Ewa Oloyin), red oil, Chin Chin, Garri Ijebu, groundnut, cray fish, plantain chips and hot pepper across a connected packaging range.']
  ]
}];

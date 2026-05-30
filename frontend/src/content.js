const COPY = {
  en: {
    localeName: "English",
    nav: {
      dashboard: "Dashboard",
      guide: "Project Guide"
    },
    header: {
      eyebrow: "Open-data-first location intelligence",
      title: "Victoria Location Intelligence",
      description:
        "An open-data-first project for evaluating Victorian locations through transport, amenities, and planning context.",
      radius: "Search radius",
      language: "Language"
    },
    search: {
      label: "Enter an address, suburb, postcode, or landmark in Victoria",
      placeholder: "Parkville, 3052, Box Hill Station, Royal Melbourne Hospital",
      button: "Search",
      searching: "Searching...",
      helper: "You can search by suburb or postcode, or click the map to analyse and highlight the surrounding area.",
      unavailable: "Geocoding is unavailable. You can still click directly on the map."
    },
    map: {
      title: "Search + Map",
      description: "Click the map or search for a Victorian place.",
      layers: "Map layers",
      selectedLocation: "Selected location"
    },
    layers: {
      train: "Train",
      tram: "Tram",
      bus: "Bus",
      trainStops: "Train stops",
      trainLines: "Train lines",
      tramStops: "Tram stops",
      tramLines: "Tram lines",
      busStops: "Bus stops",
      busLines: "Bus lines",
      transportation: "Transportation",
      schools: "Schools",
      health: "Health",
      retail: "Retail / supermarkets",
      parks_sport: "Parks / sport",
      planning: "Planning zones / overlays"
    },
    summary: {
      title: "Location Summary",
      selectedLocation: "Selected location",
      suburb: "Suburb",
      nearestTrain: "Nearest train station",
      nearestTram: "Nearest tram stop",
      nearestBus: "Nearest bus stop",
      overall: "Overall suitability score",
      transportScore: "Transport score",
      amenityScore: "Amenity score",
      planningScore: "Planning score",
      nearbyFeatures: "Nearby features",
      withinRadius: "Within selected radius",
      currentReport: "Computed from the current report",
      amenityContext: "Nearby service and facility coverage",
      planningContext: "Current planning-context placeholder",
      approximate: "Approximate",
      transparentScore: "Transparent MVP score"
    },
    report: {
      title: "Report",
      empty: "Select a point on the map or search for a place to generate the first report.",
      tabs: {
        transport: "Transport",
        amenities: "Amenities",
        profile: "Profile",
        commute: "Commute",
        planning: "Planning",
        score: "Score",
        method: "Method / Limitations"
      },
      table: {
        category: "Category"
      },
      categories: {
        transport: "Transport",
        train: "Train",
        tram: "Tram",
        bus: "Bus",
        schools: "Schools",
        health: "Health",
        retail: "Retail",
        parks_sport: "Parks / sport",
        planningContext: "Planning context",
        overall: "Overall"
      },
      profile: {
        title: "Area Profile",
        note: "This panel uses the nearest bundled reference property to surface suburb and LGA context around the selected point.",
        empty: "No bundled area profile is available for this location.",
        reference: "Reference property",
        suburb: "Suburb",
        lga: "LGA",
        referenceDistance: "Reference distance",
        lgaDistance: "LGA distance to Melbourne",
        lgaTravelTime: "LGA travel time to Melbourne",
        gpAccess: "GPs per 1,000 people",
        pharmacyAccess: "Pharmacies per 1,000 people",
        schools5km: "Schools within 5km",
        health5km: "Health services within 5km",
        sport2km: "Sport / open-space within 2km",
        retail2km: "Retail anchors within 2km"
      },
      commute: {
        title: "Commute Context",
        empty: "No bundled commute reference is available for this location.",
        weightedDistance: "Weighted target distance",
        lgaTravelTime: "Area travel time to Melbourne",
        score: "Commute score",
        destination: "Destination",
        distance: "Approximate distance",
        methodology: "Current commute methodology"
      },
      limitations: [
        "Distances are straight-line distances unless otherwise stated.",
        "The app does not provide legal, planning, property, or financial advice.",
        "OpenStreetMap and bundled public-data completeness varies by area.",
        "Nominatim is a public geocoding service with usage limits.",
        "Planning data should be checked against official Victorian Government planning tools.",
        "Property price, sale history, rental yield and live route planning are not included in the free MVP."
      ]
    },
    status: {
      loading: "Generating location report..."
    },
    common: {
      notAvailable: "Not available",
      noLocation: "No location selected"
    },
    guide: {
      eyebrow: "Project Scope",
      title: "Project Overview",
      intro:
        "Victoria Location Intelligence is a small spatial decision-support project built for personal interests and teaching purposes. It demonstrates how open data, transparent scoring, and lightweight mapping can be combined into a practical place-evaluation workflow.",
      aboutTitle: "About This Project",
      about:
        "The current public app focuses on comparing locations in Victoria through transport access, amenities, and area context. It is not intended as a transport-only dashboard; the broader aim is to show how a reusable location-intelligence workflow can be built, explained, and deployed with modest infrastructure.",
      purposeTitle: "Purpose",
      purposes: [
        "Personal interests: exploring how spatial evidence can support better place comparison and everyday decision-making.",
        "Teaching purpose: demonstrating open-data workflows, explainable scoring, and lightweight geospatial product design in a compact example."
      ],
      linksTitle: "Reference Links",
      links: [
        {
          label: "Victorian Government open data portal",
          note: "General source portal for Victorian public datasets relevant to transport, facilities, planning, and broader spatial context. Attribution and licence terms should still be checked on each dataset record page.",
          url: "https://www.data.vic.gov.au/"
        },
        {
          label: "Echo Zhou personal page",
          note: "Portfolio page for broader project context and related work.",
          url: "https://echoid.github.io/"
        }
      ],
      creditTitle: "Credits",
      credit: "Developed by Echo Zhou as a personal-interest and teaching-oriented spatial analytics project.",
      attributionTitle: "Data Attribution",
      attribution:
        "Victorian Government datasets used in this project should be credited to the relevant agency and reused under the licence specified on each dataset record page. For DataVic datasets, the default reuse pattern is typically attribution to the source agency under CC BY 4.0 unless the record states otherwise.",
      notesTitle: "Notes",
      notes: [
        "Scores and counts shown in the dashboard are generated from the currently selected location and radius, so the right-side summary reflects the latest report state rather than a static mockup.",
        "The public build relies on bundled datasets, so quality is strongest in the covered areas and weaker outside them.",
        "Planning context remains a lightweight placeholder until official polygon layers are added."
      ],
      scoring: {
        title: "Scoring Framework",
        intro: "The current score is a transparent decision-support indicator. Each dimension is exposed directly in the interface so the report remains inspectable rather than opaque.",
        dimensionLabel: "Dimension",
        weightLabel: "Weight",
        criteriaLabel: "Criteria",
        criteria: [
          {
            dimension: "Transport",
            weight: "45%",
            criteria: "Nearest train, tram, and bus access, stop density within 800m, and nearby mode diversity."
          },
          {
            dimension: "Amenities",
            weight: "45%",
            criteria: "Nearby schools, health services, retail anchors, sport or open-space proxies, and nearest-access bonuses."
          },
          {
            dimension: "Planning context",
            weight: "10%",
            criteria: "Temporary placeholder component until official planning zones and overlays are integrated."
          }
        ],
        limitations: [
          "Commute indicators in the public static build still depend mainly on straight-line approximations and bundled reference values.",
          "Planning context is not yet sourced from official polygon layers in the static MVP.",
          "A single summary score should be interpreted alongside the detailed report tabs rather than used in isolation."
        ]
      }
    }
  },
  zh: {
    localeName: "中文",
    nav: {
      dashboard: "分析面板",
      guide: "项目说明"
    },
    header: {
      eyebrow: "基于公开数据的地点分析",
      title: "维州地点智能分析",
      description: "这是一个基于公开数据的地点分析项目，用来比较维州不同地点的交通、配套和区域背景。",
      radius: "搜索范围",
      language: "语言"
    },
    search: {
      label: "输入维州的地址、区名、邮编或地标",
      placeholder: "例如 Parkville、3052、Box Hill Station、Royal Melbourne Hospital",
      button: "搜索",
      searching: "搜索中...",
      helper: "可以直接输入 suburb 或 postcode，也可以点击地图分析并高亮周边所属区域。",
      unavailable: "地理编码服务暂时不可用，你仍然可以直接点击地图选点。"
    },
    map: {
      title: "搜索与地图",
      description: "可以搜索维州地点，也可以直接点击地图。",
      layers: "地图图层",
      selectedLocation: "已选地点"
    },
    layers: {
      train: "火车",
      tram: "电车",
      bus: "公交",
      trainStops: "火车站",
      trainLines: "火车线",
      tramStops: "电车站",
      tramLines: "电车线",
      busStops: "公交站",
      busLines: "公交线",
      transportation: "交通",
      schools: "学校",
      health: "医疗",
      retail: "商超 / 零售",
      parks_sport: "公园 / 运动",
      planning: "规划分区 / 覆盖层"
    },
    summary: {
      title: "地点摘要",
      selectedLocation: "已选地点",
      suburb: "所在区域",
      nearestTrain: "最近火车站",
      nearestTram: "最近电车站",
      nearestBus: "最近公交站",
      overall: "综合适合度评分",
      transportScore: "交通分数",
      amenityScore: "配套分数",
      planningScore: "规划分数",
      nearbyFeatures: "周边要素数",
      withinRadius: "当前半径范围内",
      currentReport: "按当前报告实时计算",
      amenityContext: "基于周边服务与设施覆盖",
      planningContext: "当前为规划背景占位分数",
      approximate: "近似位置",
      transparentScore: "透明规则计算的 MVP 分数"
    },
    report: {
      title: "报告",
      empty: "请选择地图上的一个点，或先搜索一个地点来生成第一份报告。",
      tabs: {
        transport: "交通",
        amenities: "配套",
        profile: "区域画像",
        commute: "通勤",
        planning: "规划",
        score: "评分",
        method: "方法 / 限制"
      },
      table: {
        category: "类别"
      },
      categories: {
        transport: "交通",
        train: "火车",
        tram: "电车",
        bus: "公交",
        schools: "学校",
        health: "医疗",
        retail: "零售",
        parks_sport: "公园 / 运动",
        planningContext: "规划背景",
        overall: "综合"
      },
      profile: {
        title: "区域画像",
        note: "这里使用距离所选点最近的打包参考房源，来补充 suburb 和 LGA 层面的背景信息。",
        empty: "当前地点没有可用的打包区域画像。",
        reference: "参考房源",
        suburb: "Suburb",
        lga: "LGA",
        referenceDistance: "参考距离",
        lgaDistance: "LGA 距墨尔本距离",
        lgaTravelTime: "LGA 到墨尔本时间",
        gpAccess: "每千人 GP 数",
        pharmacyAccess: "每千人药房数",
        schools5km: "5 公里内学校数",
        health5km: "5 公里内医疗点数",
        sport2km: "2 公里内运动 / 开放空间",
        retail2km: "2 公里内零售锚点"
      },
      commute: {
        title: "通勤背景",
        empty: "当前地点没有可用的打包通勤参考。",
        weightedDistance: "加权目标距离",
        lgaTravelTime: "区域到墨尔本时间",
        score: "通勤分数",
        destination: "目标地点",
        distance: "近似距离",
        methodology: "当前通勤方法"
      },
      limitations: [
        "除非特别说明，距离均为直线距离估算。",
        "这个工具不提供法律、规划、房产或财务建议。",
        "OpenStreetMap 和打包进站点的公开数据在不同区域完整度不同。",
        "Nominatim 是公开地理编码服务，存在调用限制。",
        "规划信息仍需要到维州政府官方工具里进一步核对。",
        "免费 MVP 暂不包含房价、成交历史、租售比和实时路线规划。"
      ]
    },
    status: {
      loading: "正在生成地点报告..."
    },
    common: {
      notAvailable: "暂无数据",
      noLocation: "尚未选择地点"
    },
    guide: {
      eyebrow: "项目范围",
      title: "项目简介",
      intro:
        "Victoria Location Intelligence 是一个面向个人兴趣与教学用途的小型空间决策支持项目，用来展示如何把公开数据、透明评分和轻量级地图交互组织成一个可解释的地点分析流程。",
      aboutTitle: "项目说明",
      about:
        "当前公开应用重点展示维州地点在交通、配套和区域背景上的对比方式。它不是一个只看交通的仪表板，而是一个更通用的地点智能示例，用来说明空间数据产品如何被组织、解释和部署。",
      purposeTitle: "用途",
      purposes: [
        "个人兴趣：探索空间证据如何支持地点比较和日常决策。",
        "教学用途：演示开放数据流程、可解释评分和轻量级 GIS 产品设计。",
        "作品集用途：展示从数据选择、空间处理到界面设计和静态部署的一整套流程。"
      ],
      linksTitle: "参考链接",
      links: [
        {
          label: "维州政府开放数据门户",
          note: "交通、设施、规划及其他维州公开数据的通用入口。具体署名方式与许可条件仍应以各数据记录页的说明为准。",
          url: "https://www.data.vic.gov.au/"
        },
        {
          label: "Echo Zhou 个人主页",
          note: "查看更多项目背景与相关作品。",
          url: "https://echoid.github.io/"
        }
      ],
      creditTitle: "作者信息",
      credit: "由 Echo Zhou 开发，定位为面向个人兴趣与教学用途的空间分析项目。",
      attributionTitle: "数据署名",
      attribution:
        "项目中使用的维州政府数据应按各自数据记录页的要求注明来源机构与重用许可。对 DataVic 数据来说，常见的默认口径是注明来源发布机构，并按 CC BY 4.0 或记录页列出的许可条件进行重用。",
      redirectLabel: "跳转到 Echo Zhou 个人主页",
      redirectUrl: "https://echoid.github.io/",
      redirectNote: "如果想看更完整的项目背景和其他作品，可以直接访问上面的主页链接。",
      notesTitle: "说明",
      notes: [
        "右侧显示的分数和数量都来自当前选点与当前半径的实时报告，不是静态写死的数字。",
        "公开版本依赖打包数据，因此在已覆盖区域内效果更好，超出范围后结果会变弱。",
        "规划背景目前仍是轻量级占位项，正式判断还需要接入官方面状图层数据。"
      ],
      scoring: {
        title: "评分框架",
        intro: "当前分数是一个透明的辅助决策指标。各维度都直接暴露在界面里，便于解释和复核。",
        dimensionLabel: "维度",
        weightLabel: "权重",
        criteriaLabel: "标准",
        criteria: [
          {
            dimension: "交通",
            weight: "45%",
            criteria: "最近火车、电车和公交可达性，800 米范围内站点密度，以及周边交通方式多样性。"
          },
          {
            dimension: "配套",
            weight: "45%",
            criteria: "学校、医疗、零售锚点、运动 / 开放空间，以及最近配套可达性的加分。"
          },
          {
            dimension: "规划背景",
            weight: "10%",
            criteria: "在正式接入官方规划分区和 overlay 之前，当前仍是临时占位维度。"
          }
        ],
        limitations: [
          "公开静态版里的通勤指标目前仍主要依赖直线距离和打包参考值。",
          "静态 MVP 里的规划背景还没有接入官方面状图层。",
          "单一总分必须结合详细报告一起看，不能单独替代判断。"
        ]
      }
    }
  }
};

const CATEGORY_LABELS = {
  en: {
    train: "train",
    tram: "tram",
    bus: "bus",
    school: "school",
    health: "health",
    retail: "retail",
    sport: "parks / sport"
  },
  zh: {
    train: "火车",
    tram: "电车",
    bus: "公交",
    school: "学校",
    health: "医疗",
    retail: "零售",
    sport: "公园 / 运动"
  }
};

const EXACT_REASON_TRANSLATIONS = {
  "Train access is within 800m.": "800 米内有火车站。",
  "Tram access is within 800m.": "800 米内有电车站。",
  "A bus stop is within 400m.": "400 米内有公交站。",
  "Multiple public transport modes are available nearby.": "附近有多种公共交通方式可选。",
  "Nearby public transport is limited in the bundled static dataset.": "在当前打包的静态数据里，附近公共交通资源较少。",
  "Retail or supermarket anchors are represented nearby.": "附近有零售或商超锚点。",
  "Amenity coverage is sparse in the bundled static dataset.": "在当前打包的静态数据里，周边配套覆盖较弱。",
  "Planning zones are not bundled in the static MVP, so this is context only.": "静态 MVP 还没有打包规划分区数据，这里仅提供背景说明。"
};

export function getText(locale) {
  return COPY[locale] || COPY.en;
}

export function categoryLabel(category, locale) {
  return CATEGORY_LABELS[locale]?.[category] || CATEGORY_LABELS.en[category] || category;
}

export function translateReason(reason, locale) {
  if (locale !== "zh") return reason;
  if (EXACT_REASON_TRANSLATIONS[reason]) return EXACT_REASON_TRANSLATIONS[reason];

  let match = reason.match(/^(\d+) school features are within 2km\.$/);
  if (match) return `2 公里内有 ${match[1]} 个学校点位。`;

  match = reason.match(/^(\d+) health service features are within 2km\.$/);
  if (match) return `2 公里内有 ${match[1]} 个医疗服务点位。`;

  match = reason.match(/^(\d+) sport\/open-space features are within 2km\.$/);
  if (match) return `2 公里内有 ${match[1]} 个运动或开放空间点位。`;

  return reason;
}

export function translatePlanningZone(zone, locale) {
  if (locale !== "zh") return zone;
  if (zone === "Not loaded in static MVP") return "静态 MVP 尚未加载";
  return zone;
}

export function translatePlanningNote(note, locale) {
  if (locale !== "zh") return note;
  if (note === "Planning zones and overlays need a Vicmap Planning data import. Check official Victorian Government tools before making decisions.") {
    return "规划分区和 overlay 还需要接入 Vicmap Planning 数据，正式决策前请再核对维州政府官方工具。";
  }
  return note;
}

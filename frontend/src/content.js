const COPY = {
  en: {
    localeName: "English",
    nav: {
      dashboard: "Dashboard",
      guide: "Project Guide"
    },
    header: {
      eyebrow: "Open-data-first location intelligence",
      title: "Victoria Location Intelligence Dashboard",
      description:
        "A personal house-hunting project for comparing Victorian locations with transport, amenities, and planning context.",
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
      train: "Train stops / lines",
      tram: "Tram stops / lines",
      bus: "Bus stops / lines",
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
    export: {
      title: "Export / Share",
      copy: "Copy summary text",
      download: "Download JSON report",
      reportTitle: "Victoria Location Intelligence Report",
      location: "Location",
      suburbLga: "Suburb/LGA",
      overall: "Overall score",
      nearestTrain: "Nearest train",
      nearestTram: "Nearest tram",
      nearestBus: "Nearest bus"
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
      title: "Data Sources and Analytical Workflow",
      intro:
        "This dashboard was built as a structured decision-support tool for evaluating residential locations in Victoria. The immediate use case is home search, but the same workflow is also useful for demonstrating how open data, spatial reasoning, scoring logic, and lightweight deployment can be organised into a clear analytical product.",
      tabs: {
        home: "Home Search",
        teaching: "Training / Teaching"
      },
      home: {
        overviewTitle: "Project Context",
        overview:
          "The current implementation supports quick comparison of candidate locations before inspections. A user can search for an address, suburb, or landmark, inspect transport and amenity context around that point, and use the generated summary as an evidence-based shortlist aid. The broader analytical roadmap extends this point-based workflow with Vicmap facilities, SA2 regional context, routed commute-time estimates, and a more explicit liveability framework.",
        dataTitle: "Data Sources",
        dataSources: [
          {
            label: "Public transport stops and lines",
            note: "Victorian Government open data landing page used by the project download workflow.",
            url: "https://discover.data.vic.gov.au/dataset/public-transport-lines-and-stops/resource/a2cba0b0-bddc-4b87-b495-2b6b7013af6e"
          },
          {
            label: "Vicmap / ArcGIS Features of Interest",
            note: "Reference service for facilities such as schools, parks, train stations, hospitals, markets, police stations, and shopping centres used in the earlier spatial workflow.",
            url: "https://services6.arcgis.com/GB33F62SbDxJjwEL/ArcGIS/rest/services/Vicmap_Features_of_Interest/FeatureServer/8/query"
          },
          {
            label: "GTFS schedule reference",
            note: "PTV GTFS schedule landing page used as a timetable and service reference source.",
            url: "https://discover.data.vic.gov.au/dataset/gtfs-schedule"
          },
          {
            label: "ABS SA2 digital boundary files",
            note: "Boundary files used when assigning properties and facilities to SA2 regions for spatial aggregation and regional profiling.",
            url: "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files"
          },
          {
            label: "Victorian school locations",
            note: "Official Victorian Government open data portal used as the source portal for school-location extracts in the earlier workflow.",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "AIHW hospital and health-service context",
            note: "Australian Institute of Health and Welfare MyHospitals data and reporting portal.",
            url: "https://www.aihw.gov.au/reports-data/myhospitals"
          },
          {
            label: "Victorian sport facility context",
            note: "Victorian Government open data portal used for sport and recreation facility references in the earlier workflow.",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "Basemap and geocoding services",
            note: "OpenStreetMap provides the base map; Nominatim provides address, suburb, and landmark search.",
            url: "https://www.openstreetmap.org/"
          },
          {
            label: "Nominatim search API documentation",
            note: "Reference for the browser geocoding request used in the static workflow.",
            url: "https://nominatim.org/release-docs/latest/api/Search/"
          },
          {
            label: "OpenRouteService",
            note: "Route-based distance and travel-time service relevant for upgrading from straight-line proximity to commute-time indicators.",
            url: "https://openrouteservice.org/"
          }
        ],
        processTitle: "Analytical Flow",
        process: [
          "Select a candidate location by address search, suburb search, landmark search, or direct map click.",
          "Convert the selected location into latitude and longitude coordinates and set that point as the analysis centre.",
          "Retrieve nearby transport and amenity features from the bundled spatial dataset, including the facility categories that can also be queried from Vicmap / ArcGIS Features of Interest, within practical decision radii such as 400m, 800m, and 2km.",
          "Assign both candidate properties and surrounding features to SA2 geography when suburb-level or regional profiling is required, so point-based comparison can be extended into a broader area-context view.",
          "Compute nearest-stop distances and feature counts for transport, schools, health services, retail anchors, and sport or open-space proxies.",
          "Upgrade key commute indicators from straight-line distance to routed travel time where OpenRouteService or a comparable routing layer is available.",
          "Apply a transparent liveability scoring framework so access, amenity, and regional context can be compared on a consistent basis.",
          "Export the summary or discuss the map and score outputs as part of inspection planning and shortlist refinement."
        ],
        notesTitle: "Important Notes",
        notes: [
          "The public site relies on bundled point datasets, so practical coverage is strongest in the included sample areas and weaker outside them.",
          "The current public site still uses straight-line approximations for most proximity indicators; commute-time scoring would require a routing service such as OpenRouteService and a clear quota strategy.",
          "SA2 aggregation is useful for suburb and regional context, but it complements rather than replaces exact-address analysis.",
          "Planning overlays are not yet imported into the static workflow and should be checked against official Victorian planning tools.",
          "The dashboard is intended for exploratory comparison and does not replace professional property, legal, planning, or financial advice."
        ],
        scoring: {
          title: "Liveability Scoring Framework",
          intro: "The current public score is intended as a transparent decision-support indicator rather than a black-box ranking. Each dimension has an explicit share of the overall result, and each share is linked to observable transport, amenity, or planning signals.",
          dimensionLabel: "Dimension",
          weightLabel: "Weight",
          criteriaLabel: "Criteria",
          criteria: [
            {
              dimension: "Transport",
              weight: "45%",
              criteria: "Nearest train, tram, and bus access, stop density within 800m, and mode diversity within the surrounding catchment."
            },
            {
              dimension: "Amenities",
              weight: "45%",
              criteria: "Nearby schools, health services, retail anchors, sport or open-space proxies, and nearest-access bonuses."
            },
            {
              dimension: "Planning context",
              weight: "10%",
              criteria: "Temporary placeholder component until official planning zones and overlays are integrated into the public workflow."
            }
          ],
          limitations: [
            "Commute indicators in the public static build still depend mainly on straight-line approximations and bundled reference values.",
            "Planning context is not yet sourced from official polygon layers in the static MVP.",
            "A single summary score should be interpreted alongside the transport, amenity, commute, and area-profile panels rather than used in isolation."
          ]
        }
      },
      teaching: {
        overviewTitle: "Teaching Use",
        overview:
          "The same project can be used as a compact teaching example for open-data product design, lightweight geospatial analytics, and explainable scoring. It is suitable for demonstrating a complete pipeline from problem framing to data selection, Vicmap facility extraction, SA2 aggregation, route-aware accessibility, liveability scoring, interface design, and static deployment.",
        linksTitle: "Useful Links",
        links: [
          {
            label: "Transport Victoria / Victorian open data",
            note: "Public transport, spatial, and related Victorian datasets.",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "Vicmap / ArcGIS Features of Interest",
            note: "Facility-service endpoint that illustrates how a teaching example can query categories such as schools, hospitals, parks, train stations, markets, and shopping centres.",
            url: "https://services6.arcgis.com/GB33F62SbDxJjwEL/ArcGIS/rest/services/Vicmap_Features_of_Interest/FeatureServer/8/query"
          },
          {
            label: "ABS SA2 digital boundary files",
            note: "Core reference for teaching spatial joins, region assignment, and suburb-profile construction.",
            url: "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files"
          },
          {
            label: "AIHW MyHospitals",
            note: "Health-system reporting and hospital context references.",
            url: "https://www.aihw.gov.au/reports-data/myhospitals"
          },
          {
            label: "OpenStreetMap",
            note: "Base map and open geographic reference ecosystem.",
            url: "https://www.openstreetmap.org/"
          },
          {
            label: "Nominatim search API",
            note: "Example of a public geocoding service used in browser-based workflows.",
            url: "https://nominatim.org/release-docs/latest/api/Search/"
          },
          {
            label: "OpenRouteService",
            note: "Useful when teaching the difference between straight-line proximity and routed travel-time accessibility.",
            url: "https://openrouteservice.org/"
          },
          {
            label: "Leaflet",
            note: "Map interaction model relevant to simple geospatial teaching demos.",
            url: "https://leafletjs.com/"
          },
          {
            label: "Vite",
            note: "Frontend build tool used for the static React deployment.",
            url: "https://vite.dev/"
          }
        ],
        flowTitle: "Useful Teaching Flow",
        flow: [
          "Start with a concrete decision problem rather than a generic dashboard brief.",
          "Identify which inputs are directly observable, which are derived, and which are still missing from the current MVP.",
          "Use open-data portals and public APIs to assemble a first working spatial dataset, including public transport, Vicmap / ArcGIS features of interest, and any supporting education or health references.",
          "Geocode candidate properties or landmarks, then join them to SA2 boundaries so the class can compare point-based indicators with regional profiles.",
          "Calculate both local proximity features and broader suburb-context features, then explain where a route engine such as OpenRouteService changes the interpretation from straight-line distance to commute time.",
          "Translate these engineered variables into an explicit liveability scoring framework, including weights, trade-offs, and explanation text.",
          "Expose the logic in the UI so users can understand why a location scores well or poorly, then deploy a lightweight version before discussing what a backend or database-backed architecture would add."
        ],
        outputsTitle: "Suggested Teaching Outputs",
        outputs: [
          "A problem-definition note that explains why spatial evidence matters for the decision context.",
          "A small source register showing what was downloaded, from where, and for what purpose.",
          "A feature-engineering summary covering Vicmap facilities, SA2 aggregation, route-aware commute indicators, and score design.",
          "A liveability scoring note that explains criteria, weights, and what remains outside the current model.",
          "A lightweight demo that can be reviewed in class without cloud infrastructure prerequisites."
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
      title: "维州买房地点交通与配套分析",
      description: "这是我自己买房时用的 personal project，用来比较维州不同地点的交通、配套和整体居住便利度。",
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
      train: "火车站 / 线路",
      tram: "电车站 / 线路",
      bus: "公交站 / 线路",
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
    export: {
      title: "导出 / 分享",
      copy: "复制摘要文本",
      download: "下载 JSON 报告",
      reportTitle: "维州地点分析报告",
      location: "地点",
      suburbLga: "区域 / LGA",
      overall: "综合分数",
      nearestTrain: "最近火车站",
      nearestTram: "最近电车站",
      nearestBus: "最近公交站"
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
      title: "数据来源与分析流程",
      intro:
        "这个 dashboard 最初是为维州买房选址准备的辅助分析工具，用来把地点选择、公开数据、空间判断和可解释评分放到同一个清晰流程里。除了自用场景，它也适合作为 open data、GIS 思维和轻量级产品化流程的教学示例。",
      tabs: {
        home: "买房选址",
        teaching: "教学 / 训练"
      },
      home: {
        overviewTitle: "项目背景",
        overview:
          "当前版本重点支持看房前的地点初筛。用户可以先输入地址、区名或地标，再结合交通、学校、医疗、商超和运动设施等空间信息，对候选地点做更系统的比较，而不是只依赖印象判断。更完整的分析路线还可以继续接入 Vicmap / ArcGIS 设施数据、SA2 区域画像、基于 ORS 的通勤时间，以及更明确的 liveability scoring 框架。",
        dataTitle: "数据来源",
        dataSources: [
          {
            label: "公共交通站点与线路",
            note: "项目下载脚本直接使用的维州政府开放数据落地页。",
            url: "https://discover.data.vic.gov.au/dataset/public-transport-lines-and-stops/resource/a2cba0b0-bddc-4b87-b495-2b6b7013af6e"
          },
          {
            label: "Vicmap / ArcGIS Features of Interest",
            note: "早期空间流程里用于学校、公园、火车站、医院、市场、警局和购物中心等设施查询的服务接口。",
            url: "https://services6.arcgis.com/GB33F62SbDxJjwEL/ArcGIS/rest/services/Vicmap_Features_of_Interest/FeatureServer/8/query"
          },
          {
            label: "GTFS 时刻表参考",
            note: "作为 PTV GTFS 时刻表与服务结构的参考入口。",
            url: "https://discover.data.vic.gov.au/dataset/gtfs-schedule"
          },
          {
            label: "ABS SA2 边界文件",
            note: "把房源和设施点位映射到 SA2 区域、构建区域画像时使用的官方边界数据。",
            url: "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files"
          },
          {
            label: "维州学校位置数据",
            note: "学校点位历史抽取所对应的维州政府开放数据门户。",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "AIHW 医院与医疗服务参考",
            note: "Australian Institute of Health and Welfare 的 MyHospitals 数据与报告入口。",
            url: "https://www.aihw.gov.au/reports-data/myhospitals"
          },
          {
            label: "维州运动设施参考",
            note: "运动与休闲设施历史抽取所对应的维州政府开放数据门户。",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "底图与地理编码服务",
            note: "OpenStreetMap 提供底图，Nominatim 提供地址、区名和地标搜索。",
            url: "https://www.openstreetmap.org/"
          },
          {
            label: "Nominatim Search API 文档",
            note: "静态页面浏览器端地理编码请求所依据的接口文档。",
            url: "https://nominatim.org/release-docs/latest/api/Search/"
          },
          {
            label: "OpenRouteService",
            note: "用于把直线距离升级为路线距离或通勤时间指标的服务入口。",
            url: "https://openrouteservice.org/"
          }
        ],
        processTitle: "分析流程",
        process: [
          "先通过地址搜索、区名搜索、地标搜索或直接点击地图，确定候选地点。",
          "将所选地点转成经纬度坐标，并把该点设为分析中心。",
          "从已打包的空间数据中提取 400 米、800 米和 2 公里等决策半径内的交通与配套点位，这套逻辑也可以扩展到 Vicmap / ArcGIS 的设施类别。",
          "当需要做 suburb 或区域画像时，把候选地点和设施进一步映射到 SA2 区域，从点位比较扩展到区域背景分析。",
          "计算最近站点距离，以及学校、医疗、零售和运动设施等类别的数量与可达性。",
          "在可用时把关键通勤指标从直线距离升级为基于 ORS 的路线距离或时间。",
          "按照透明的 liveability scoring 规则生成分项分数和总分，使不同地点可以在同一逻辑下比较。",
          "把摘要、地图和评分结果用于看房前的筛选、复盘和 shortlist 调整。"
        ],
        notesTitle: "重要说明",
        notes: [
          "公开网站依赖打包后的点位数据，因此在当前样本覆盖区域内效果最好，超出范围后结果会变弱。",
          "当前公开网站大多仍使用直线距离估算；如果要做更真实的通勤评分，需要引入 ORS 之类的路线服务和配额策略。",
          "SA2 聚合适合补充 suburb / 区域画像，但不能替代精确地址级判断。",
          "规划 overlay 还未正式接入静态流程，正式判断仍应回到维州官方规划工具。",
          "这个 dashboard 用于探索式比较，不构成房产、法律、规划或财务建议。"
        ],
        scoring: {
          title: "Liveability Scoring 框架",
          intro: "当前公开分数是一个透明的辅助决策指标，而不是黑箱排名。每个维度在总分里占有明确比例，并且都能追溯到可观察的交通、配套或规划信号。",
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
            "静态 MVP 里的规划背景还没有接入官方 polygon 图层。",
            "单一总分必须和交通、配套、通勤以及区域画像面板一起看，才有解释力。"
          ]
        }
      },
      teaching: {
        overviewTitle: "教学用途",
        overview:
          "同一项目也可以作为教学示例，用来说明如何把一个具体决策问题转化为 open-data 产品：从问题定义、数据选择、Vicmap 设施抽取、SA2 聚合、ORS 通勤时间、liveability scoring，到前端展示与静态部署，形成一个完整而可讲解的流程。",
        linksTitle: "Useful Links",
        links: [
          {
            label: "维州政府开放数据门户",
            note: "公共交通与其他维州公开数据的主要入口。",
            url: "https://discover.data.vic.gov.au/"
          },
          {
            label: "Vicmap / ArcGIS Features of Interest",
            note: "可用于教学演示学校、医院、公园、火车站、市场和购物中心等设施查询的服务接口。",
            url: "https://services6.arcgis.com/GB33F62SbDxJjwEL/ArcGIS/rest/services/Vicmap_Features_of_Interest/FeatureServer/8/query"
          },
          {
            label: "ABS SA2 边界文件",
            note: "讲解 spatial join、区域聚合和 suburb profile 时最核心的官方边界参考。",
            url: "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files"
          },
          {
            label: "AIHW MyHospitals",
            note: "医疗系统与医院信息的公开参考入口。",
            url: "https://www.aihw.gov.au/reports-data/myhospitals"
          },
          {
            label: "OpenStreetMap",
            note: "开放地图底图与地理参考生态。",
            url: "https://www.openstreetmap.org/"
          },
          {
            label: "Nominatim Search API",
            note: "浏览器端 geocoding 示例。",
            url: "https://nominatim.org/release-docs/latest/api/Search/"
          },
          {
            label: "OpenRouteService",
            note: "适合教学演示直线距离与真实路线时间差异的路线服务。",
            url: "https://openrouteservice.org/"
          },
          {
            label: "Leaflet",
            note: "适合教学演示的轻量级地图交互库。",
            url: "https://leafletjs.com/"
          },
          {
            label: "Vite",
            note: "当前静态 React 前端的构建工具。",
            url: "https://vite.dev/"
          }
        ],
        flowTitle: "Useful Teaching Flow",
        flow: [
          "从一个明确的现实问题开始，而不是从一个抽象 dashboard 题目开始。",
          "区分哪些输入是直接观测得到的，哪些指标需要后续推导，哪些数据仍然缺失。",
          "先用开放数据和公共 API 拼出第一个能运行的空间数据版本，包括公共交通、Vicmap / ArcGIS 设施数据，以及必要的教育或医疗参考数据。",
          "对房源或候选地点做 geocoding，再与 SA2 边界做空间连接，让学生同时看到点位指标和区域画像。",
          "同时计算局部可达性指标和区域背景指标，并说明 ORS 这类路线服务如何把直线距离升级为通勤时间。",
          "把这些特征整理成明确的 liveability scoring 框架，包括维度、权重、取舍和解释文字。",
          "在界面里暴露逻辑，让使用者知道某个地点为什么得分高或低。",
          "先部署轻量版本，再讨论如果升级为后端 / 数据库架构，系统会发生哪些变化。"
        ],
        outputsTitle: "Suggested Teaching Outputs",
        outputs: [
          "一份问题定义说明，解释为什么空间证据对该决策场景重要。",
          "一份简短的数据来源登记表，说明下载了什么、从哪里来、用途是什么。",
          "一份特征工程摘要，覆盖 Vicmap 设施、SA2 聚合、通勤时间和评分设计。",
          "一份 liveability scoring 说明，明确标准、权重以及当前模型尚未覆盖的部分。",
          "一个无需复杂云基础设施即可课堂演示的轻量级 demo。"
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

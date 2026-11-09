// Twelve different quest graphs; no shared kill-count or mandatory boss template.
export const HOMECOMING_ADVENTURES={
  "attack-magic": {
    "mechanic": "祖爐熱壓",
    "start": "valve",
    "vars": {
      "heat": 0,
      "pressure": 0
    },
    "nodes": {
      "valve": {
        "text": "祖爐有兩支獨立儀表。銘牌：熱量需達 2 格，壓力需達 1 格才能鑄入火種。",
        "choices": [
          {
            "id": "fuel",
            "label": "加入燃料（熱量 +1）",
            "next": "valve",
            "effects": {
              "heat": 1
            },
            "requires": {}
          },
          {
            "id": "vent",
            "label": "開啟洩壓（壓力 −1）",
            "next": "valve",
            "effects": {
              "pressure": -1
            },
            "requires": {}
          },
          {
            "id": "seal",
            "label": "封住側閥（壓力 +1）",
            "next": "valve",
            "effects": {
              "pressure": 1
            },
            "requires": {}
          },
          {
            "id": "ignite",
            "label": "穩定儀表，投入火種",
            "next": "breach",
            "effects": {},
            "requires": {
              "heat": 2,
              "pressure": 1
            },
            "hint": "再看一次銘牌：熱量 2、壓力 1。"
          },
          {
            "id": "reset",
            "label": "冷卻祖爐，重新調整",
            "next": "valve",
            "effects": {
              "heat": {
                "set": 0
              },
              "pressure": {
                "set": 0
              }
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "breach": {
        "text": "點火引出了吞食爐心的空殼。必須保住剛恢復的火種。",
        "choices": [],
        "location": "boss",
        "combat": true,
        "next": "finish"
      },
      "finish": {
        "text": "最後一顆火種由誰送回主城？",
        "choices": [
          {
            "id": "elder",
            "label": "讓守爐長點燃城心",
            "next": "done",
            "effects": {},
            "requires": {}
          },
          {
            "id": "partner",
            "label": "讓夥伴帶居民重新點火",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "magic-attack": {
    "mechanic": "風向導航",
    "start": "route",
    "vars": {
      "beacons": 0
    },
    "nodes": {
      "route": {
        "text": "航圖註記：逆風不可直飛；幼鳥羽片的銀面會指向穩定氣流。",
        "choices": [
          {
            "id": "gust",
            "label": "追逐最亮的雷光",
            "next": "lost",
            "effects": {},
            "requires": {}
          },
          {
            "id": "feather",
            "label": "觀察羽片，繞行北側雲隙",
            "next": "beacon",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "lost": {
        "text": "雷光是風暴倒影。你停靠浮島避風，沒有遺失幼鳥。",
        "choices": [
          {
            "id": "return",
            "label": "重看航圖",
            "next": "route",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "beacon": {
        "text": "第一座航標向西傾斜，但羽片指向東方。",
        "choices": [
          {
            "id": "east",
            "label": "轉向東方，校正航標",
            "next": "flock",
            "effects": {
              "beacons": 1
            },
            "requires": {}
          },
          {
            "id": "west",
            "label": "跟隨傾斜航標",
            "next": "lost",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "flock": {
        "text": "幼鳥停在斷橋，成鳥繞著天都。先引回哪一群？",
        "choices": [
          {
            "id": "young",
            "label": "先帶幼鳥躲入背風處，再引導成鳥",
            "next": "landing",
            "effects": {},
            "requires": {}
          },
          {
            "id": "adult",
            "label": "先追成鳥，回頭接幼鳥",
            "next": "detour",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "detour": {
        "text": "成鳥不肯離開幼鳥。請用叫聲把鳥群一起帶到背風處。",
        "choices": [
          {
            "id": "call",
            "label": "請夥伴模仿歸巢聲",
            "next": "landing",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "landing": {
        "text": "天都的引航官等候歸巢記錄。",
        "choices": [
          {
            "id": "report",
            "label": "交還羽片與航圖",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "attack-defense": {
    "mechanic": "撤離護送",
    "start": "load",
    "vars": {
      "supplies": 3,
      "rescued": 0
    },
    "nodes": {
      "load": {
        "text": "車隊有 3 份補給。醫療帳與斷橋各需要 1 份，必須先安排撤離再守關。",
        "choices": [
          {
            "id": "medic",
            "label": "派 1 份補給給醫療帳",
            "next": "bridge",
            "effects": {
              "supplies": -1,
              "rescued": 2
            },
            "requires": {}
          }
        ],
        "location": "town"
      },
      "bridge": {
        "text": "車隊遇到斷橋。可以鋪設臨時橋，也可以繞道穿過伏擊區。",
        "choices": [
          {
            "id": "repair",
            "label": "花 1 份補給鋪橋",
            "next": "last",
            "effects": {
              "supplies": -1,
              "rescued": 2
            },
            "requires": {}
          },
          {
            "id": "detour",
            "label": "保留補給，走峽谷小路",
            "next": "ambush",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "ambush": {
        "text": "峽谷的斥候堵住退路。護送戰勝利後車隊繼續前進。",
        "choices": [],
        "location": "field",
        "combat": true,
        "next": "last"
      },
      "last": {
        "text": "最後一車居民還在城外；守關隊長請你決定留守方式。",
        "choices": [
          {
            "id": "cover",
            "label": "花 1 份補給佈置掩護，接回居民",
            "next": "gate",
            "effects": {
              "supplies": -1,
              "rescued": 3
            },
            "requires": {}
          },
          {
            "id": "escort",
            "label": "親自掩護最後一車",
            "next": "rear",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "rear": {
        "text": "夥伴站到撤離隊伍最後方，擋住追兵。",
        "choices": [],
        "location": "field",
        "combat": true,
        "next": "gate"
      },
      "gate": {
        "text": "城門可以關閉了。裂隙攻城獸逼近，最後一戰只為守住平民。",
        "choices": [],
        "location": "boss",
        "combat": true,
        "next": "done"
      }
    }
  },
  "defense-attack": {
    "mechanic": "爐堡潛入",
    "start": "entrance",
    "vars": {
      "alarm": 0,
      "key": 0
    },
    "nodes": {
      "entrance": {
        "text": "空鎧依聲音巡邏。礦車入口很近，舊排煙道更安全。",
        "choices": [
          {
            "id": "cart",
            "label": "搭礦車衝入（警戒 +1）",
            "next": "workshop",
            "effects": {
              "alarm": 1
            },
            "requires": {}
          },
          {
            "id": "duct",
            "label": "沿舊排煙道潛入",
            "next": "workshop",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "workshop": {
        "text": "工匠被鎖在工作間。牆上有鑰匙箱，旁邊的警鈴仍通著電。",
        "choices": [
          {
            "id": "cut",
            "label": "先切斷警鈴，再取出鑰匙",
            "next": "prison",
            "effects": {
              "key": 1
            },
            "requires": {}
          },
          {
            "id": "smash",
            "label": "敲碎鑰匙箱（警戒 +1）",
            "next": "prison",
            "effects": {
              "key": 1,
              "alarm": 1
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "prison": {
        "text": "打開工作間後，工匠可協助停爐。警戒過高時必須先清除巡邏隊。",
        "choices": [
          {
            "id": "quiet",
            "label": "帶工匠繞過巡邏隊",
            "next": "shutdown",
            "effects": {},
            "requires": {
              "alarm": {
                "max": 1
              },
              "key": 1
            },
            "hint": "警戒已升高，先引開巡邏隊。"
          },
          {
            "id": "fight",
            "label": "引開巡邏隊，保護工匠撤離",
            "next": "patrol",
            "effects": {},
            "requires": {
              "key": 1
            }
          }
        ],
        "location": "field"
      },
      "patrol": {
        "text": "巡邏空鎧集中到你的位置，工匠正前往控制室。",
        "choices": [],
        "location": "field",
        "combat": true,
        "next": "shutdown"
      },
      "shutdown": {
        "text": "三個操縱桿：先停供能，再排餘熱。先拉紅桿會重新供能。",
        "choices": [
          {
            "id": "power",
            "label": "切斷供能",
            "next": "cool",
            "effects": {},
            "requires": {}
          },
          {
            "id": "red",
            "label": "拉動紅桿",
            "next": "shutdown",
            "effects": {
              "alarm": 1
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "cool": {
        "text": "供能已停止，主爐仍有餘熱。",
        "choices": [
          {
            "id": "cool",
            "label": "打開冷卻水閘，安全救出全部工匠",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      }
    }
  },
  "attack-support": {
    "mechanic": "豐收物資交換",
    "start": "market",
    "vars": {
      "grain": 2,
      "herb": 0,
      "wheel": 0
    },
    "nodes": {
      "market": {
        "text": "商隊缺車輪，木匠需要藥草，藥師願意用藥草交換一袋穀物。你有兩袋穀物。",
        "choices": [
          {
            "id": "herb",
            "label": "用 1 袋穀物向藥師換藥草",
            "next": "market",
            "effects": {
              "grain": -1,
              "herb": 1
            },
            "requires": {
              "grain": {
                "min": 1
              }
            }
          },
          {
            "id": "wheel",
            "label": "用藥草向木匠換車輪",
            "next": "market",
            "effects": {
              "herb": -1,
              "wheel": 1
            },
            "requires": {
              "herb": {
                "min": 1
              }
            }
          },
          {
            "id": "deliver",
            "label": "帶車輪去接商隊",
            "next": "cart",
            "effects": {},
            "requires": {
              "wheel": {
                "min": 1
              }
            }
          }
        ],
        "location": "town"
      },
      "cart": {
        "text": "商隊修好車輪，但村口的麟靈不肯離開田野。",
        "choices": [
          {
            "id": "offer",
            "label": "留下 1 袋穀物，請麟靈引路",
            "next": "root",
            "effects": {
              "grain": -1
            },
            "requires": {
              "grain": {
                "min": 1
              }
            }
          },
          {
            "id": "ask",
            "label": "沒有餘糧，請商隊指認被污染的田埂",
            "next": "track",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "track": {
        "text": "沿斷裂車轍找到被棘藤覆蓋的灌溉渠。",
        "choices": [
          {
            "id": "water",
            "label": "把清水引回田野",
            "next": "root",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "root": {
        "text": "棘獸不是敵軍，而是被堵住水脈的守護者。",
        "choices": [
          {
            "id": "clear",
            "label": "疏通水渠並請夥伴安撫麟靈",
            "next": "feast",
            "effects": {},
            "requires": {}
          },
          {
            "id": "chase",
            "label": "驅趕棘獸",
            "next": "warning",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "warning": {
        "text": "棘獸退走又折返：真正的問題仍在水渠。",
        "choices": [
          {
            "id": "listen",
            "label": "停下來觀察牠守住的水口",
            "next": "root",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "feast": {
        "text": "遲來的收穫祭開桌了。",
        "choices": [
          {
            "id": "share",
            "label": "把商隊和村民都請上桌",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "support-attack": {
    "mechanic": "武鄉招式對決",
    "start": "read",
    "vars": {
      "wins": 0
    },
    "nodes": {
      "read": {
        "text": "師父留下三行步痕：「重擊讓步、突進側移、蓄勢破招」。讀完才能找到禁地的入口。",
        "choices": [
          {
            "id": "begin",
            "label": "進入演武台",
            "next": "heavy",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      },
      "heavy": {
        "text": "木人抬起雙臂，準備重擊。",
        "choices": [
          {
            "id": "back",
            "label": "後撤讓步",
            "next": "dash",
            "effects": {
              "wins": 1
            },
            "requires": {}
          },
          {
            "id": "rush",
            "label": "正面搶攻",
            "next": "retry",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "dash": {
        "text": "木人壓低身形，直線突進。",
        "choices": [
          {
            "id": "side",
            "label": "側移避開",
            "next": "charge",
            "effects": {
              "wins": 1
            },
            "requires": {}
          },
          {
            "id": "stand",
            "label": "原地硬接",
            "next": "retry",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "charge": {
        "text": "木人收刀蓄勢，空門短暫露出。",
        "choices": [
          {
            "id": "break",
            "label": "立即破招",
            "next": "master",
            "effects": {
              "wins": 1
            },
            "requires": {}
          },
          {
            "id": "wait",
            "label": "繼續等待",
            "next": "retry",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "retry": {
        "text": "木人收招停下，夥伴重新指出師父的步痕。",
        "choices": [
          {
            "id": "again",
            "label": "從第一式重新演練",
            "next": "heavy",
            "effects": {
              "wins": {
                "set": 0
              }
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "master": {
        "text": "禁地裡沒有叛徒，只有替弟子壓住失控戰旗的師父。",
        "choices": [
          {
            "id": "take",
            "label": "與師父合力接下戰旗",
            "next": "duel",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "duel": {
        "text": "以一場演武證明你能接下守鄉的責任。",
        "choices": [],
        "location": "field",
        "combat": true,
        "next": "done"
      }
    }
  },
  "magic-defense": {
    "mechanic": "記憶旋律",
    "start": "listen",
    "vars": {
      "notes": 0
    },
    "nodes": {
      "listen": {
        "text": "司書記得的歌詞：「溪水先醒，鐘聲隨後，最後是人的歌聲」。旋律可隨時重聽，不考驗手速。",
        "choices": [
          {
            "id": "hear",
            "label": "沿旋律找回城市的聲音",
            "next": "first",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      },
      "first": {
        "text": "第一段記憶應該是哪個聲音？",
        "choices": [
          {
            "id": "water",
            "label": "溪水",
            "next": "second",
            "effects": {
              "notes": 1
            },
            "requires": {}
          },
          {
            "id": "bell",
            "label": "鐘聲",
            "next": "wrong",
            "effects": {},
            "requires": {}
          },
          {
            "id": "voice",
            "label": "歌聲",
            "next": "wrong",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "second": {
        "text": "溪水已響起，下一段呢？",
        "choices": [
          {
            "id": "water",
            "label": "溪水",
            "next": "wrong",
            "effects": {},
            "requires": {}
          },
          {
            "id": "bell",
            "label": "鐘聲",
            "next": "third",
            "effects": {
              "notes": 1
            },
            "requires": {}
          },
          {
            "id": "voice",
            "label": "歌聲",
            "next": "wrong",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "third": {
        "text": "溪水與鐘聲已經接合，最後一段呢？",
        "choices": [
          {
            "id": "voice",
            "label": "歌聲",
            "next": "release",
            "effects": {
              "notes": 1
            },
            "requires": {}
          },
          {
            "id": "bell",
            "label": "鐘聲",
            "next": "wrong",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "wrong": {
        "text": "晶柱出現雜音，司書重新唱出「溪水、鐘聲、歌聲」。",
        "choices": [
          {
            "id": "retry",
            "label": "重新排列三段記憶",
            "next": "first",
            "effects": {
              "notes": {
                "set": 0
              }
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "release": {
        "text": "居民的記憶重新連起；噤聲晶核無法再藏在旋律裡。",
        "choices": [],
        "location": "boss",
        "combat": true,
        "next": "done"
      }
    }
  },
  "defense-magic": {
    "mechanic": "誓文證詞推理",
    "start": "witness",
    "vars": {
      "keeper": 0,
      "child": 0,
      "record": 0
    },
    "nodes": {
      "witness": {
        "text": "隔離令稱「居民不具誓印」。三份線索可任意順序調查，已找到的線索會保留。",
        "choices": [
          {
            "id": "keeper",
            "label": "詢問守門人：昨夜符塔自行改寫名冊",
            "next": "witness",
            "effects": {
              "keeper": {
                "set": 1
              }
            },
            "requires": {}
          },
          {
            "id": "child",
            "label": "詢問孩童：祖傳誓印仍會發光",
            "next": "witness",
            "effects": {
              "child": {
                "set": 1
              }
            },
            "requires": {}
          },
          {
            "id": "record",
            "label": "查閱舊檔：守護誓文禁止遺棄居民",
            "next": "witness",
            "effects": {
              "record": {
                "set": 1
              }
            },
            "requires": {}
          },
          {
            "id": "judge",
            "label": "帶著三份線索前往符塔裁定",
            "next": "judge",
            "effects": {},
            "requires": {
              "keeper": 1,
              "child": 1,
              "record": 1
            }
          }
        ],
        "location": "town"
      },
      "judge": {
        "text": "裁定者問：「是居民背誓，還是符塔執行了錯誤的命令？」",
        "choices": [
          {
            "id": "blame",
            "label": "責怪居民遺失誓印",
            "next": "explain",
            "effects": {},
            "requires": {}
          },
          {
            "id": "law",
            "label": "用祖傳誓印與舊誓文證明符塔誤判",
            "next": "seal",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "explain": {
        "text": "孩童的誓印仍亮著。居民沒有背誓，錯誤在名冊與命令。",
        "choices": [
          {
            "id": "retry",
            "label": "重新提出裁定",
            "next": "judge",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "seal": {
        "text": "不用摧毀整座塔。選擇恢復哪一條最初的命令？",
        "choices": [
          {
            "id": "protect",
            "label": "守護所有仍持誓印的居民",
            "next": "done",
            "effects": {},
            "requires": {}
          },
          {
            "id": "isolate",
            "label": "隔離所有無法辨認的居民",
            "next": "judge",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      }
    }
  },
  "magic-support": {
    "mechanic": "霧港辨船",
    "start": "book",
    "vars": {
      "rescued": 0
    },
    "nodes": {
      "book": {
        "text": "船冊：白鷗號＝雙短燈／載藥；晨潮號＝長短燈／缺桅；沒有船登記紅燈。可回城重看船冊。",
        "choices": [
          {
            "id": "sail",
            "label": "出港引航",
            "next": "red",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      },
      "red": {
        "text": "濃霧裡有船亮紅燈，卻自稱白鷗號。",
        "choices": [
          {
            "id": "hold",
            "label": "保持距離，要求再次報燈號",
            "next": "redreveal",
            "effects": {},
            "requires": {}
          },
          {
            "id": "follow",
            "label": "直接跟隨",
            "next": "fog",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "redreveal": {
        "text": "紅燈船無法回答載貨內容，應如何處理？",
        "choices": [
          {
            "id": "reject",
            "label": "標記為霧影，繼續尋找真船",
            "next": "gull",
            "effects": {},
            "requires": {}
          },
          {
            "id": "trust",
            "label": "讓它跟在船後",
            "next": "fog",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "fog": {
        "text": "霧影把你引回浮標，守燈人吹響返航笛；船隊仍安全。",
        "choices": [
          {
            "id": "reset",
            "label": "回到原航線重新辨認",
            "next": "red",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "gull": {
        "text": "下一艘亮起雙短燈，船員說載著藥箱。",
        "choices": [
          {
            "id": "guide",
            "label": "確認白鷗號，引導靠岸",
            "next": "tide",
            "effects": {
              "rescued": 1
            },
            "requires": {}
          },
          {
            "id": "ignore",
            "label": "再觀察船冊",
            "next": "gull",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "tide": {
        "text": "最後一艘長短燈，缺少主桅。",
        "choices": [
          {
            "id": "tow",
            "label": "確認晨潮號，以繩索拖帶",
            "next": "harbor",
            "effects": {
              "rescued": 1
            },
            "requires": {}
          },
          {
            "id": "wait",
            "label": "等待它自己駛近",
            "next": "rescue",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "rescue": {
        "text": "船不能逆風。夥伴提醒你準備拖纜。",
        "choices": [
          {
            "id": "rope",
            "label": "拋出拖纜",
            "next": "harbor",
            "effects": {
              "rescued": 1
            },
            "requires": {}
          }
        ],
        "location": "field"
      },
      "harbor": {
        "text": "兩艘真船都已靠岸，黎明重新出現在海面。",
        "choices": [
          {
            "id": "light",
            "label": "把確認過的航路交給守燈人",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "support-magic": {
    "mechanic": "四季雲脈編織",
    "start": "loom",
    "vars": {
      "spring": 0,
      "summer": 0,
      "autumn": 0,
      "winter": 0
    },
    "nodes": {
      "loom": {
        "text": "織機四角失去平衡。春對秋、夏對冬；四角都固定好才能承住浮台。",
        "choices": [
          {
            "id": "spring",
            "label": "固定春風絲線",
            "next": "loom",
            "effects": {
              "spring": {
                "set": 1
              }
            },
            "requires": {}
          },
          {
            "id": "summer",
            "label": "固定夏雨絲線",
            "next": "loom",
            "effects": {
              "summer": {
                "set": 1
              }
            },
            "requires": {}
          },
          {
            "id": "autumn",
            "label": "沿春風對角接上秋霜",
            "next": "loom",
            "effects": {
              "autumn": {
                "set": 1
              }
            },
            "requires": {
              "spring": 1
            }
          },
          {
            "id": "winter",
            "label": "沿夏雨對角接上冬雪",
            "next": "loom",
            "effects": {
              "winter": {
                "set": 1
              }
            },
            "requires": {
              "summer": 1
            }
          },
          {
            "id": "weave",
            "label": "收緊四角雲脈",
            "next": "balance",
            "effects": {},
            "requires": {
              "spring": 1,
              "summer": 1,
              "autumn": 1,
              "winter": 1
            }
          }
        ],
        "location": "field"
      },
      "balance": {
        "text": "先抬起哪一邊，浮台才不會翻覆？織機提示：兩側必須一起受力。",
        "choices": [
          {
            "id": "both",
            "label": "請夥伴同時牽住兩側雲脈",
            "next": "residents",
            "effects": {},
            "requires": {}
          },
          {
            "id": "one",
            "label": "只拉住左側",
            "next": "tilt",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "tilt": {
        "text": "浮台傾斜，夥伴暫時撐住它；先鬆開絲線再重試。",
        "choices": [
          {
            "id": "retry",
            "label": "調整為兩側同時受力",
            "next": "balance",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "residents": {
        "text": "屋舍已穩定，長者還想為故鄉留下什麼？",
        "choices": [
          {
            "id": "garden",
            "label": "留下能隨四季變化的空中花園",
            "next": "done",
            "effects": {},
            "requires": {}
          },
          {
            "id": "bridge",
            "label": "把剩餘雲絲織成家家相通的橋",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "defense-support": {
    "mechanic": "生命樹資源救援",
    "start": "roots",
    "vars": {
      "sap": 6,
      "people": 0,
      "trunk": 0,
      "seed": 0
    },
    "nodes": {
      "roots": {
        "text": "只剩 6 滴生命樹液：居民救援需 2、支撐主根需 3、幼苗需 1。請自行安排順序，三處都要保住。",
        "choices": [
          {
            "id": "people",
            "label": "花 2 滴，救出根室居民",
            "next": "roots",
            "effects": {
              "sap": -2,
              "people": {
                "set": 1
              }
            },
            "requires": {
              "sap": {
                "min": 2
              },
              "people": 0
            }
          },
          {
            "id": "trunk",
            "label": "花 3 滴，支撐斷裂主根",
            "next": "roots",
            "effects": {
              "sap": -3,
              "trunk": {
                "set": 1
              }
            },
            "requires": {
              "sap": {
                "min": 3
              },
              "trunk": 0
            }
          },
          {
            "id": "seed",
            "label": "花 1 滴，保護新生幼苗",
            "next": "roots",
            "effects": {
              "sap": -1,
              "seed": {
                "set": 1
              }
            },
            "requires": {
              "sap": {
                "min": 1
              },
              "seed": 0
            }
          },
          {
            "id": "luxury",
            "label": "花 2 滴，讓枯葉暫時回綠",
            "next": "roots",
            "effects": {
              "sap": -2
            },
            "requires": {
              "sap": {
                "min": 2
              }
            }
          },
          {
            "id": "recover",
            "label": "回收尚未固定的樹液，重新分配",
            "next": "roots",
            "effects": {
              "sap": {
                "set": 6
              },
              "people": {
                "set": 0
              },
              "trunk": {
                "set": 0
              },
              "seed": {
                "set": 0
              }
            },
            "requires": {}
          },
          {
            "id": "protect",
            "label": "三處安全，守住最後的生根時刻",
            "next": "defend",
            "effects": {},
            "requires": {
              "people": 1,
              "trunk": 1,
              "seed": 1
            }
          }
        ],
        "location": "field"
      },
      "defend": {
        "text": "寄生靈趁幼苗生根時來襲。戰勝牠們，讓樹城自己恢復生命。",
        "choices": [],
        "location": "field",
        "combat": true,
        "next": "ceremony"
      },
      "ceremony": {
        "text": "長老希望把幼苗留給誰照顧？",
        "choices": [
          {
            "id": "children",
            "label": "交給根室獲救的孩子",
            "next": "done",
            "effects": {},
            "requires": {}
          },
          {
            "id": "all",
            "label": "邀請全城輪流守望",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  },
  "support-defense": {
    "mechanic": "雪地救援路線",
    "start": "plan",
    "vars": {
      "fuel": 5,
      "scouted": 0
    },
    "nodes": {
      "plan": {
        "text": "雪橇帶了 5 份燃料。古泉圖標著短隧道，山脊路看似安全卻更耗補給。",
        "choices": [
          {
            "id": "scout",
            "label": "花 1 份燃料偵察短隧道",
            "next": "plan",
            "effects": {
              "fuel": -1,
              "scouted": {
                "set": 1
              }
            },
            "requires": {
              "fuel": {
                "min": 1
              },
              "scouted": 0
            }
          },
          {
            "id": "tunnel",
            "label": "花 1 份燃料，走已偵察的短隧道",
            "next": "shelter",
            "effects": {
              "fuel": -1
            },
            "requires": {
              "fuel": {
                "min": 1
              },
              "scouted": 1
            }
          },
          {
            "id": "ridge",
            "label": "花 3 份燃料，走山脊繞路",
            "next": "shelter",
            "effects": {
              "fuel": -3
            },
            "requires": {
              "fuel": {
                "min": 3
              }
            }
          }
        ],
        "location": "town"
      },
      "shelter": {
        "text": "找到了受困居民。給避難棚生火需要 1 份燃料；不能讓居民冒雪再走。",
        "choices": [
          {
            "id": "warm",
            "label": "花 1 份燃料，先讓居民暖和",
            "next": "spring",
            "effects": {
              "fuel": -1
            },
            "requires": {
              "fuel": {
                "min": 1
              }
            }
          }
        ],
        "location": "field"
      },
      "spring": {
        "text": "泉眼被冰封。可花 2 份燃料融冰，或請夥伴循古泉圖找地下水脈。",
        "choices": [
          {
            "id": "melt",
            "label": "花 2 份燃料，安全融開泉眼",
            "next": "home",
            "effects": {
              "fuel": -2
            },
            "requires": {
              "fuel": {
                "min": 2
              }
            }
          },
          {
            "id": "map",
            "label": "研究古泉圖上的地下水脈",
            "next": "map",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "map": {
        "text": "古圖的水紋由低處向上湧出。應先開哪一個口？",
        "choices": [
          {
            "id": "lower",
            "label": "下方導水口",
            "next": "home",
            "effects": {},
            "requires": {}
          },
          {
            "id": "upper",
            "label": "上方排氣口",
            "next": "ice",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "ice": {
        "text": "氣流帶走熱量，水仍未流出。夥伴指向地面湧泉的紋路。",
        "choices": [
          {
            "id": "retry",
            "label": "重新判讀古泉圖",
            "next": "map",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "field"
      },
      "home": {
        "text": "居民喝到第一口溫泉水，村外仍飄著雪。",
        "choices": [
          {
            "id": "deliver",
            "label": "護送最後一隊居民回村",
            "next": "done",
            "effects": {},
            "requires": {}
          }
        ],
        "location": "town"
      }
    }
  }
};

export function newHomecomingAdventure(id){const d=HOMECOMING_ADVENTURES[id];return d?{step:d.start,vars:{...d.vars},decisions:[]}:null;}
export function normalizeHomecomingAdventure(id,raw){
 const d=HOMECOMING_ADVENTURES[id];if(!d)return null;
 const a=newHomecomingAdventure(id);
 if(!raw||!d.nodes[raw.step])return a;
 a.step=raw.step;
 for(const k of Object.keys(a.vars))a.vars[k]=Number.isFinite(raw.vars?.[k])?Math.min(99,Math.max(0,Math.floor(raw.vars[k]))):a.vars[k];
 a.decisions=Array.isArray(raw.decisions)?raw.decisions.filter(v=>typeof v==='string'&&v.length<100).slice(-64):[];
 return a;
}
export function adventureLocation(route,step){return ({town:route.townId,field:route.fieldId,boss:route.bossMapId})[step.location];}
export function adventureChoiceError(adventure,choice){
 for(const [k,r] of Object.entries(choice.requires||{})){
 const v=adventure.vars[k]??0;
 if(typeof r==='number'?v!==r:(r.min!==undefined&&v<r.min)||(r.max!==undefined&&v>r.max))return choice.hint||'條件尚未符合，請查看線索與目前資源。';
 }
 return '';
}
export function advanceAdventure(route,adventure,choiceId,{victory=false}={}){
 const d=HOMECOMING_ADVENTURES[route.id],step=d?.nodes[adventure?.step];if(!step)throw Error('任務節點不存在');
 let next;
 if(victory){if(!step.combat)throw Error('目前沒有待完成的戰鬥');next=step.next;}
 else{
  if(step.combat)throw Error('請先完成當前戰鬥');
  const c=step.choices.find(c=>c.id===choiceId);if(!c)throw Error('未知的任務選項');
  const error=adventureChoiceError(adventure,c);if(error)throw Error(error);
  for(const [k,e] of Object.entries(c.effects||{}))adventure.vars[k]=typeof e==='number'?Math.max(0,Math.min(99,(adventure.vars[k]||0)+e)):e.set;
  adventure.decisions.push(adventure.step+':'+c.id);adventure.decisions=adventure.decisions.slice(-64);next=c.next;
 }
 if(next!=='done'&&!d.nodes[next])throw Error('任務後續節點不存在');
 if(next!=='done')adventure.step=next;
 return next==='done';
}

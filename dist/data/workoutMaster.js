const DIFFICULTY_KEYS = ['beginner', 'intermediate', 'advanced'];
const CATEGORY_KEYS = ['cardio', 'bodyweight', 'weights'];
const UNIT_KEYS = ['weightReps', 'time'];

const workoutMasterEntriesBase = [
  {
    "id": "walking",
    "isActive": true,
    "sortOrder": 10,
    "label": "ウォーキング",
    "category": "cardio",
    "muscles": [
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "ウォーキングで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "jogging",
    "isActive": true,
    "sortOrder": 20,
    "label": "ジョギング",
    "category": "cardio",
    "muscles": [
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "ジョギングで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "running",
    "isActive": true,
    "sortOrder": 30,
    "label": "ランニング",
    "category": "cardio",
    "muscles": [
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "ランニングで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "cycling",
    "isActive": true,
    "sortOrder": 40,
    "label": "サイクリング",
    "category": "cardio",
    "muscles": [
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "サイクリングで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "aerobics",
    "isActive": true,
    "sortOrder": 50,
    "label": "エアロビクス",
    "category": "cardio",
    "muscles": [
      "fullbody",
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "エアロビクスで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "stretching",
    "isActive": true,
    "sortOrder": 60,
    "label": "ストレッチ",
    "category": "cardio",
    "muscles": [
      "other",
      "core"
    ],
    "unit": "time",
    "description": "ストレッチで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 120
          },
          {
            "timeSeconds": 120
          },
          {
            "timeSeconds": 120
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 40,
          "perWork": 0,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 40,
          "perWork": 0,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 40,
          "perWork": 0,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "soccer",
    "isActive": true,
    "sortOrder": 70,
    "label": "サッカー",
    "category": "cardio",
    "muscles": [
      "legs",
      "core",
      "fullbody"
    ],
    "unit": "time",
    "description": "サッカーで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "basketball",
    "isActive": true,
    "sortOrder": 80,
    "label": "バスケットボール",
    "category": "cardio",
    "muscles": [
      "legs",
      "arms",
      "core",
      "fullbody"
    ],
    "unit": "time",
    "description": "バスケットボールで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          },
          {
            "timeSeconds": 540
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "tennis",
    "isActive": true,
    "sortOrder": 90,
    "label": "テニス",
    "category": "cardio",
    "muscles": [
      "arms",
      "shoulders",
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "テニスで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "swimming",
    "isActive": true,
    "sortOrder": 100,
    "label": "水泳",
    "category": "cardio",
    "muscles": [
      "fullbody",
      "shoulders",
      "back",
      "core"
    ],
    "unit": "time",
    "description": "水泳で持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "badminton",
    "isActive": true,
    "sortOrder": 110,
    "label": "バドミントン",
    "category": "cardio",
    "muscles": [
      "legs",
      "arms",
      "shoulders",
      "core"
    ],
    "unit": "time",
    "description": "バドミントンで持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          },
          {
            "timeSeconds": 240
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          },
          {
            "timeSeconds": 360
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          },
          {
            "timeSeconds": 480
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "table-tennis",
    "isActive": true,
    "sortOrder": 120,
    "label": "卓球",
    "category": "cardio",
    "muscles": [
      "arms",
      "core",
      "legs"
    ],
    "unit": "time",
    "description": "卓球で持久力と全身の連動性を高める有酸素運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          },
          {
            "timeSeconds": 180
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 3600
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "一定ペースで呼吸を整えながら実施する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          },
          {
            "timeSeconds": 300
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 5400
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "姿勢とリズムを保って継続する。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          },
          {
            "timeSeconds": 420
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 7200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でもフォームを崩さず安全第一で行う。"
      }
    }
  },
  {
    "id": "push-ups",
    "isActive": true,
    "sortOrder": 130,
    "label": "腕立て伏せ",
    "category": "bodyweight",
    "muscles": [
      "chest",
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "胸・肩・腕・体幹を鍛える基本の自重プレス。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 30
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "knee-push-ups",
    "isActive": true,
    "sortOrder": 140,
    "label": "腕立て伏せ（膝付き）",
    "category": "bodyweight",
    "muscles": [
      "chest",
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "膝をついて負荷を調整し、押す動作を習得する種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "sit-ups",
    "isActive": true,
    "sortOrder": 150,
    "label": "腹筋",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "体幹前面を鍛える基本的な腹筋運動。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "v-ups",
    "isActive": true,
    "sortOrder": 160,
    "label": "V字腹筋",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "上体と下肢を同時に引き上げて体幹を鍛える種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "abdominal-crunches",
    "isActive": true,
    "sortOrder": 170,
    "label": "アブドミナルクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "腹直筋を集中的に鍛えるクランチ。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 16
          },
          {
            "weight": 0,
            "reps": 16
          },
          {
            "weight": 0,
            "reps": 16
          },
          {
            "weight": 0,
            "reps": 16
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "side-crunches",
    "isActive": true,
    "sortOrder": 180,
    "label": "サイドクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "体幹側面を意識して行う腹筋種目。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "twist-crunches",
    "isActive": true,
    "sortOrder": 190,
    "label": "ツイストクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ひねり動作で腹斜筋を鍛えるクランチ。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          },
          {
            "weight": 0,
            "reps": 14
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          },
          {
            "weight": 0,
            "reps": 18
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "leg-raises",
    "isActive": true,
    "sortOrder": 200,
    "label": "レッグレイズ",
    "category": "bodyweight",
    "muscles": [
      "core",
      "legs"
    ],
    "unit": "weightReps",
    "description": "下腹部中心に鍛える脚上げ種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "ab-roller",
    "isActive": true,
    "sortOrder": 210,
    "label": "アブローラー",
    "category": "bodyweight",
    "muscles": [
      "core",
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "体幹全体を強く使うローラー種目。",
    "restSeconds": 45,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 6
          },
          {
            "weight": 0,
            "reps": 6
          },
          {
            "weight": 0,
            "reps": 6
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "decline-sit-ups",
    "isActive": true,
    "sortOrder": 220,
    "label": "デクラインシットアップ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "傾斜を使って負荷を高めた腹筋種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "squats",
    "isActive": true,
    "sortOrder": 230,
    "label": "スクワット",
    "category": "bodyweight",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "下半身と体幹を鍛える自重スクワット。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          },
          {
            "weight": 0,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          },
          {
            "weight": 0,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "jump-squats",
    "isActive": true,
    "sortOrder": 240,
    "label": "ジャンプスクワット",
    "category": "bodyweight",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "爆発的に跳び上がる自重スクワット。",
    "restSeconds": 45,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          },
          {
            "weight": 0,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "pull-ups",
    "isActive": true,
    "sortOrder": 250,
    "label": "懸垂",
    "category": "bodyweight",
    "muscles": [
      "back",
      "arms",
      "shoulders",
      "core"
    ],
    "unit": "weightReps",
    "description": "背中と腕を中心に鍛える引く動作の自重種目。",
    "restSeconds": 60,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 5
          },
          {
            "weight": 0,
            "reps": 5
          },
          {
            "weight": 0,
            "reps": 5
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 15
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 20
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          },
          {
            "weight": 0,
            "reps": 10
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 25
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "plank",
    "isActive": true,
    "sortOrder": 260,
    "label": "プランク",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "time",
    "description": "体幹を一直線で保持する静的種目。",
    "restSeconds": 25,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 30
          },
          {
            "timeSeconds": 30
          },
          {
            "timeSeconds": 30
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 300
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "姿勢を作り、呼吸を止めずに保持する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 600
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "体幹を締め、ぶれを最小限に保つ。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 70
          },
          {
            "timeSeconds": 70
          },
          {
            "timeSeconds": 70
          },
          {
            "timeSeconds": 70
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 1200
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でも肩と腰の位置を崩さない。"
      }
    }
  },
  {
    "id": "side-plank",
    "isActive": true,
    "sortOrder": 270,
    "label": "サイドプランク",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "time",
    "description": "体幹側面を安定させる静的種目。",
    "restSeconds": 25,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 25
          },
          {
            "timeSeconds": 25
          },
          {
            "timeSeconds": 25
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 240
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "姿勢を作り、呼吸を止めずに保持する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 40
          },
          {
            "timeSeconds": 40
          },
          {
            "timeSeconds": 40
          },
          {
            "timeSeconds": 40
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 480
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "体幹を締め、ぶれを最小限に保つ。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 60
          },
          {
            "timeSeconds": 60
          },
          {
            "timeSeconds": 60
          },
          {
            "timeSeconds": 60
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 960
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でも肩と腰の位置を崩さない。"
      }
    }
  },
  {
    "id": "assisted-handstand-hold",
    "isActive": true,
    "sortOrder": 280,
    "label": "倒立維持（補助あり）",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "time",
    "description": "壁補助を使って倒立姿勢を保持する種目。",
    "restSeconds": 45,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 20
          },
          {
            "timeSeconds": 20
          },
          {
            "timeSeconds": 20
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 180
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "姿勢を作り、呼吸を止めずに保持する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 35
          },
          {
            "timeSeconds": 35
          },
          {
            "timeSeconds": 35
          },
          {
            "timeSeconds": 35
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 360
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "体幹を締め、ぶれを最小限に保つ。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 55
          },
          {
            "timeSeconds": 55
          },
          {
            "timeSeconds": 55
          },
          {
            "timeSeconds": 55
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 600
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でも肩と腰の位置を崩さない。"
      }
    }
  },
  {
    "id": "freestanding-handstand-hold",
    "isActive": true,
    "sortOrder": 290,
    "label": "倒立維持（補助なし）",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "time",
    "description": "補助なしで倒立バランスを維持する種目。",
    "restSeconds": 50,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "timeSeconds": 15
          },
          {
            "timeSeconds": 15
          },
          {
            "timeSeconds": 15
          }
        ],
        "maxSets": 6,
        "limits": {
          "timeSeconds": {
            "min": 20,
            "max": 120
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
        },
        "howto": "姿勢を作り、呼吸を止めずに保持する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "timeSeconds": 30
          },
          {
            "timeSeconds": 30
          },
          {
            "timeSeconds": 30
          },
          {
            "timeSeconds": 30
          }
        ],
        "maxSets": 7,
        "limits": {
          "timeSeconds": {
            "min": 30,
            "max": 300
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
        },
        "howto": "体幹を締め、ぶれを最小限に保つ。"
      },
      "advanced": {
        "defaultSets": [
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          },
          {
            "timeSeconds": 45
          }
        ],
        "maxSets": 8,
        "limits": {
          "timeSeconds": {
            "min": 40,
            "max": 480
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
        },
        "howto": "長時間でも肩と腰の位置を崩さない。"
      }
    }
  },
  {
    "id": "handstand-push-ups",
    "isActive": true,
    "sortOrder": 300,
    "label": "倒立押上",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "倒立姿勢で押し上げる高難度の自重プレス。",
    "restSeconds": 70,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 3
          },
          {
            "weight": 0,
            "reps": 3
          },
          {
            "weight": 0,
            "reps": 3
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 0
          },
          "reps": {
            "min": 5,
            "max": 10
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 5
          },
          {
            "weight": 0,
            "reps": 5
          },
          {
            "weight": 0,
            "reps": 5
          },
          {
            "weight": 0,
            "reps": 5
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 10
          },
          "reps": {
            "min": 6,
            "max": 15
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          },
          {
            "weight": 0,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 20
          },
          "reps": {
            "min": 8,
            "max": 20
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "shrug",
    "isActive": true,
    "sortOrder": 310,
    "label": "シュラッグ",
    "category": "weights",
    "muscles": [
      "back",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "僧帽筋を中心に鍛えるすくめ動作の種目。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 10
          },
          {
            "weight": 16,
            "reps": 10
          },
          {
            "weight": 16,
            "reps": 10
          },
          {
            "weight": 16,
            "reps": 10
          },
          {
            "weight": 16,
            "reps": 10
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "bent-over-row",
    "isActive": true,
    "sortOrder": 320,
    "label": "ベントオーバーロー",
    "category": "weights",
    "muscles": [
      "back",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "前傾姿勢で背中を引き込むローイング種目。",
    "restSeconds": 50,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 18,
            "reps": 8
          },
          {
            "weight": 18,
            "reps": 8
          },
          {
            "weight": 18,
            "reps": 8
          },
          {
            "weight": 18,
            "reps": 8
          },
          {
            "weight": 18,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "weighted-squats",
    "isActive": true,
    "sortOrder": 330,
    "label": "スクワット",
    "category": "weights",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "バーベルやダンベルを使う下半身の基礎種目。",
    "restSeconds": 50,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 30,
            "reps": 8
          },
          {
            "weight": 30,
            "reps": 8
          },
          {
            "weight": 30,
            "reps": 8
          },
          {
            "weight": 30,
            "reps": 8
          },
          {
            "weight": 30,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "lunges",
    "isActive": true,
    "sortOrder": 340,
    "label": "ランジ",
    "category": "weights",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "前後動作で下半身と体幹を鍛える種目。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 10
          },
          {
            "weight": 6,
            "reps": 10
          },
          {
            "weight": 6,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 14,
            "reps": 10
          },
          {
            "weight": 14,
            "reps": 10
          },
          {
            "weight": 14,
            "reps": 10
          },
          {
            "weight": 14,
            "reps": 10
          },
          {
            "weight": 14,
            "reps": 10
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "deadlifts",
    "isActive": true,
    "sortOrder": 350,
    "label": "デッドリフト",
    "category": "weights",
    "muscles": [
      "back",
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "全身連動で引き上げる高効率ウエイト種目。",
    "restSeconds": 70,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 20,
            "reps": 8
          },
          {
            "weight": 20,
            "reps": 8
          },
          {
            "weight": 20,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 80
          },
          "reps": {
            "min": 5,
            "max": 15
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 140
          },
          "reps": {
            "min": 6,
            "max": 20
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 50,
            "reps": 6
          },
          {
            "weight": 50,
            "reps": 6
          },
          {
            "weight": 50,
            "reps": 6
          },
          {
            "weight": 50,
            "reps": 6
          },
          {
            "weight": 50,
            "reps": 6
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 220
          },
          "reps": {
            "min": 8,
            "max": 25
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "calf-raises",
    "isActive": true,
    "sortOrder": 360,
    "label": "カーフレイズ",
    "category": "weights",
    "muscles": [
      "legs"
    ],
    "unit": "weightReps",
    "description": "ふくらはぎを鍛える足関節伸展種目。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 5,
            "reps": 15
          },
          {
            "weight": 5,
            "reps": 15
          },
          {
            "weight": 5,
            "reps": 15
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 18
          },
          {
            "weight": 10,
            "reps": 18
          },
          {
            "weight": 10,
            "reps": 18
          },
          {
            "weight": 10,
            "reps": 18
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 15,
            "reps": 20
          },
          {
            "weight": 15,
            "reps": 20
          },
          {
            "weight": 15,
            "reps": 20
          },
          {
            "weight": 15,
            "reps": 20
          },
          {
            "weight": 15,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "military-press",
    "isActive": true,
    "sortOrder": 370,
    "label": "ミリタリープレス",
    "category": "weights",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "立位で肩と腕を鍛えるプレス種目。",
    "restSeconds": 50,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 8
          },
          {
            "weight": 8,
            "reps": 8
          },
          {
            "weight": 8,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "shoulder-press",
    "isActive": true,
    "sortOrder": 380,
    "label": "ショルダープレス",
    "category": "weights",
    "muscles": [
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "肩を中心に押し上げる基本種目。",
    "restSeconds": 45,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          },
          {
            "weight": 16,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "side-raises",
    "isActive": true,
    "sortOrder": 390,
    "label": "サイドレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "肩の中部を狙う挙上種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "front-raises",
    "isActive": true,
    "sortOrder": 400,
    "label": "フロントレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "肩前部を狙う挙上種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "lateral-raises",
    "isActive": true,
    "sortOrder": 410,
    "label": "ラタラルレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "肩の中部を安定して刺激する挙上種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          },
          {
            "weight": 4,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          },
          {
            "weight": 6,
            "reps": 14
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "curls",
    "isActive": true,
    "sortOrder": 420,
    "label": "カール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "上腕二頭筋を鍛える基本カール。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 5,
            "reps": 10
          },
          {
            "weight": 5,
            "reps": 10
          },
          {
            "weight": 5,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          },
          {
            "weight": 12,
            "reps": 10
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "preacher-curls",
    "isActive": true,
    "sortOrder": 430,
    "label": "プリーチャーカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "反動を抑えて上腕二頭筋を狙うカール。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 5,
            "reps": 10
          },
          {
            "weight": 5,
            "reps": 10
          },
          {
            "weight": 5,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          },
          {
            "weight": 10,
            "reps": 10
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "wrist-curls",
    "isActive": true,
    "sortOrder": 440,
    "label": "リストカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "前腕屈筋群を鍛える手首屈曲種目。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 3,
            "reps": 15
          },
          {
            "weight": 3,
            "reps": 15
          },
          {
            "weight": 3,
            "reps": 15
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 5,
            "reps": 18
          },
          {
            "weight": 5,
            "reps": 18
          },
          {
            "weight": 5,
            "reps": 18
          },
          {
            "weight": 5,
            "reps": 18
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 7,
            "reps": 20
          },
          {
            "weight": 7,
            "reps": 20
          },
          {
            "weight": 7,
            "reps": 20
          },
          {
            "weight": 7,
            "reps": 20
          },
          {
            "weight": 7,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "reverse-wrist-curls",
    "isActive": true,
    "sortOrder": 450,
    "label": "リバースリストカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "前腕伸筋群を鍛える手首伸展種目。",
    "restSeconds": 30,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 2,
            "reps": 15
          },
          {
            "weight": 2,
            "reps": 15
          },
          {
            "weight": 2,
            "reps": 15
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 4,
            "reps": 18
          },
          {
            "weight": 4,
            "reps": 18
          },
          {
            "weight": 4,
            "reps": 18
          },
          {
            "weight": 4,
            "reps": 18
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 20
          },
          {
            "weight": 6,
            "reps": 20
          },
          {
            "weight": 6,
            "reps": 20
          },
          {
            "weight": 6,
            "reps": 20
          },
          {
            "weight": 6,
            "reps": 20
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "bench-press",
    "isActive": true,
    "sortOrder": 460,
    "label": "ベンチプレス",
    "category": "weights",
    "muscles": [
      "chest",
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "胸・肩・腕を中心に鍛える代表的なプレス種目。",
    "restSeconds": 60,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 15,
            "reps": 8
          },
          {
            "weight": 15,
            "reps": 8
          },
          {
            "weight": 15,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 80
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 25,
            "reps": 10
          },
          {
            "weight": 25,
            "reps": 10
          },
          {
            "weight": 25,
            "reps": 10
          },
          {
            "weight": 25,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 130
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 200
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "incline-bench-press",
    "isActive": true,
    "sortOrder": 470,
    "label": "インクラインベンチプレス",
    "category": "weights",
    "muscles": [
      "chest",
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "胸上部と肩前部を狙うプレス種目。",
    "restSeconds": 55,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 8
          },
          {
            "weight": 12,
            "reps": 8
          },
          {
            "weight": 12,
            "reps": 8
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 110
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 28,
            "reps": 8
          },
          {
            "weight": 28,
            "reps": 8
          },
          {
            "weight": 28,
            "reps": 8
          },
          {
            "weight": 28,
            "reps": 8
          },
          {
            "weight": 28,
            "reps": 8
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 170
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "fly",
    "isActive": true,
    "sortOrder": 480,
    "label": "フライ",
    "category": "weights",
    "muscles": [
      "chest",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "胸を開閉して刺激する種目。",
    "restSeconds": 45,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 6,
            "reps": 10
          },
          {
            "weight": 6,
            "reps": 10
          },
          {
            "weight": 6,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "weighted-abdominal-crunches",
    "isActive": true,
    "sortOrder": 490,
    "label": "アブドミナルクランチ",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "負荷を加えて腹筋を鍛えるクランチ。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 5,
            "reps": 12
          },
          {
            "weight": 5,
            "reps": 12
          },
          {
            "weight": 5,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 15
          },
          {
            "weight": 8,
            "reps": 15
          },
          {
            "weight": 8,
            "reps": 15
          },
          {
            "weight": 8,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "cable-woodchops",
    "isActive": true,
    "sortOrder": 500,
    "label": "ケーブルウッドチョップ",
    "category": "weights",
    "muscles": [
      "core",
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "回旋動作で体幹を鍛えるケーブル種目。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "cable-crunches",
    "isActive": true,
    "sortOrder": 510,
    "label": "ケーブルクランチ",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ケーブル負荷で腹直筋を鍛える種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 15,
            "reps": 15
          },
          {
            "weight": 15,
            "reps": 15
          },
          {
            "weight": 15,
            "reps": 15
          },
          {
            "weight": 15,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 20,
            "reps": 15
          },
          {
            "weight": 20,
            "reps": 15
          },
          {
            "weight": 20,
            "reps": 15
          },
          {
            "weight": 20,
            "reps": 15
          },
          {
            "weight": 20,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "cable-side-bends",
    "isActive": true,
    "sortOrder": 520,
    "label": "ケーブルサイドベント",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "体幹側面を鍛える側屈種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          },
          {
            "weight": 8,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          },
          {
            "weight": 12,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 15
          },
          {
            "weight": 16,
            "reps": 15
          },
          {
            "weight": 16,
            "reps": 15
          },
          {
            "weight": 16,
            "reps": 15
          },
          {
            "weight": 16,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "rotary-torso",
    "isActive": true,
    "sortOrder": 530,
    "label": "ロータリートルソー",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "体幹回旋を強化するマシン/ケーブル種目。",
    "restSeconds": 35,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 14,
            "reps": 15
          },
          {
            "weight": 14,
            "reps": 15
          },
          {
            "weight": 14,
            "reps": 15
          },
          {
            "weight": 14,
            "reps": 15
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 18,
            "reps": 15
          },
          {
            "weight": 18,
            "reps": 15
          },
          {
            "weight": 18,
            "reps": 15
          },
          {
            "weight": 18,
            "reps": 15
          },
          {
            "weight": 18,
            "reps": 15
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  },
  {
    "id": "triceps-extension",
    "isActive": true,
    "sortOrder": 540,
    "label": "トライセップスエクステンション",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "上腕三頭筋を狙う伸展種目。",
    "restSeconds": 40,
    "difficulties": {
      "beginner": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          },
          {
            "weight": 8,
            "reps": 10
          }
        ],
        "maxSets": 6,
        "limits": {
          "weight": {
            "min": 0,
            "max": 40
          },
          "reps": {
            "min": 5,
            "max": 20
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
        },
        "howto": "軽めの重量で可動域と姿勢を確認する。"
      },
      "intermediate": {
        "defaultSets": [
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          },
          {
            "weight": 12,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
          },
          "reps": {
            "min": 6,
            "max": 25
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
        },
        "howto": "反動を使わず対象筋へ効かせる。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          },
          {
            "weight": 16,
            "reps": 12
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 100
          },
          "reps": {
            "min": 8,
            "max": 30
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
        },
        "howto": "高重量時もフォームを優先し、無理なら重量を下げる。"
      }
    }
  }
];

const INPUT_MODE_KEYS = ['weightReps', 'reps', 'time'];
const TIMER_MODE_KEYS = ['interval', 'setRest', 'time'];
const TRACKING_METRIC_KEYS = ['distance'];

const applyExerciseOverrides = (entry) => {
  const timeIds = new Set(['walking','jogging','running','cycling','aerobics','stretching','soccer','basketball','tennis','swimming','badminton','table-tennis']);
  const repsIds = new Set(['push-ups','knee-push-ups','sit-ups','v-ups','abdominal-crunches','side-crunches','twist-crunches','leg-raises','ab-roller','decline-sit-ups','squats','jump-squats','pull-ups','handstand-push-ups']);
  const holdIds = new Set(['plank','side-plank','assisted-handstand-hold','freestanding-handstand-hold']);
  const weightRepsIds = new Set(['shrug','bent-over-row','weighted-squats','lunges','deadlifts','calf-raises','military-press','shoulder-press','side-raises','front-raises','lateral-raises','curls','preacher-curls','wrist-curls','reverse-wrist-curls','bench-press','incline-bench-press','fly','weighted-abdominal-crunches','cable-woodchops','cable-crunches','cable-side-bends','rotary-torso','triceps-extension']);

  const forceMode = timeIds.has(entry.id)
    ? 'time'
    : repsIds.has(entry.id)
      ? 'reps'
      : holdIds.has(entry.id)
        ? 'time'
        : weightRepsIds.has(entry.id)
          ? 'weightReps'
          : null;

  const baselineSet = (mode) => {
    if (mode === 'reps') return { reps: 10 };
    if (mode === 'time') return { timeSeconds: 60 };
    if (mode === 'weightReps') {
      const defaultWeightMap = {
        shrug: 20, 'bent-over-row': 30, 'weighted-squats': 30, lunges: 20, deadlifts: 40, 'calf-raises': 20,
        'military-press': 20, 'shoulder-press': 20, 'side-raises': 5, 'front-raises': 5, 'lateral-raises': 5,
        curls: 10, 'preacher-curls': 10, 'wrist-curls': 10, 'reverse-wrist-curls': 10,
        'bench-press': 30, 'incline-bench-press': 20, fly: 10,
        'weighted-abdominal-crunches': 15, 'cable-woodchops': 15, 'cable-crunches': 20, 'cable-side-bends': 15, 'rotary-torso': 20, 'triceps-extension': 10,
      };
      return { weight: defaultWeightMap[entry.id] ?? 10, reps: 10 };
    }
    return null;
  };

  const withDifficultyOverride = (difficulty = {}) => {
    if (!forceMode || forceMode === 'time') return difficulty;
    const base = baselineSet(forceMode);
    return {
      ...difficulty,
      defaultSets: [base, base, base, base, base],
      maxSets: Math.max(Number(difficulty.maxSets || 1), 5),
      restSeconds: 60,
    };
  };

  const next = {
    ...entry,
    inputMode: forceMode || (entry.unit === 'time' ? 'time' : 'weightReps'),
    defaultTimerMode: forceMode === 'time' ? 'time' : 'setRest',
    trackingMetrics: ['running', 'cycling'].includes(entry.id) ? ['distance'] : [],
    goalConfig: entry.id === 'running'
      ? { type: 'distance', defaultValue: 1500, min: 100, max: 100000, step: 100, unitLabel: 'm' }
      : null,
    difficulties: {
      beginner: withDifficultyOverride(entry.difficulties.beginner),
      intermediate: withDifficultyOverride(entry.difficulties.intermediate),
      advanced: withDifficultyOverride(entry.difficulties.advanced),
    },
  };

  if (next.inputMode === 'reps') next.unit = 'weightReps';
  if (next.inputMode === 'time') next.unit = 'time';
  if (next.inputMode === 'time') {
    next.restSeconds = 0;
    next.defaultTimeMode = holdIds.has(entry.id) ? 'intervalTimer' : 'stopwatch';
  }
  if (next.id === 'abdominal-crunches') next.label = 'クランチ';
  if (next.id === 'weighted-abdominal-crunches') next.label = 'クランチ（加重）';
  if (next.id === 'weighted-squats') next.label = 'スクワット（加重）';
  return next;
};

export const workoutMasterEntries = workoutMasterEntriesBase.map((entry) => applyExerciseOverrides(entry));

const assert = (condition, message) => {
  if (!condition) throw new Error(`[workoutMaster] ${message}`);
};

export const validateWorkoutMaster = (entries = workoutMasterEntries) => {
  const ids = new Set();
  (entries || []).forEach((entry, index) => {
    assert(entry && typeof entry === 'object', `entries[${index}] が不正です`);
    assert(typeof entry.id === 'string' && entry.id.trim(), `entries[${index}] の id は必須です`);
    assert(!ids.has(entry.id), `id が重複しています: ${entry.id}`);
    ids.add(entry.id);

    assert(typeof entry.label === 'string' && entry.label.trim(), `${entry.id}.label は必須です`);
    assert(CATEGORY_KEYS.includes(entry.category), `${entry.id}.category が不正です: ${entry.category}`);
    assert(UNIT_KEYS.includes(entry.unit), `${entry.id}.unit が不正です: ${entry.unit}`);
    assert(INPUT_MODE_KEYS.includes(entry.inputMode), `${entry.id}.inputMode が不正です: ${entry.inputMode}`);
    assert(TIMER_MODE_KEYS.includes(entry.defaultTimerMode), `${entry.id}.defaultTimerMode が不正です: ${entry.defaultTimerMode}`);
    assert(Array.isArray(entry.trackingMetrics), `${entry.id}.trackingMetrics は配列が必要です`);
    entry.trackingMetrics.forEach((metric) => assert(TRACKING_METRIC_KEYS.includes(metric), `${entry.id}.trackingMetric が不正です: ${metric}`));
    assert(Array.isArray(entry.muscles) && entry.muscles.length > 0, `${entry.id}.muscles は 1 件以上必要です`);
    assert(typeof entry.restSeconds === 'number' && entry.restSeconds >= 0, `${entry.id}.restSeconds が不正です`);

    DIFFICULTY_KEYS.forEach((difficulty) => {
      const def = entry.difficulties?.[difficulty];
      assert(def, `${entry.id}.difficulties.${difficulty} が不足しています`);
      assert(Array.isArray(def.defaultSets) && def.defaultSets.length > 0, `${entry.id}.${difficulty}.defaultSets は 1 件以上必要です`);
      assert(typeof def.maxSets === 'number' && def.maxSets > 0, `${entry.id}.${difficulty}.maxSets が不正です`);
      assert(def.points && typeof def.points === 'object', `${entry.id}.${difficulty}.points が不足しています`);
    });
  });
  return true;
};

export const buildTrainingDefinitionsMap = (entries = workoutMasterEntries) => {
  validateWorkoutMaster(entries);
  return (entries || []).reduce((acc, entry) => {
    acc[entry.id] = {
      id: entry.id,
      label: entry.label,
      category: entry.category,
      muscles: entry.muscles,
      unit: entry.unit,
      inputMode: entry.inputMode,
      defaultTimerMode: entry.defaultTimerMode,
      trackingMetrics: entry.trackingMetrics,
      goalConfig: entry.goalConfig,
      description: entry.description,
      restSeconds: entry.restSeconds,
      difficulties: entry.difficulties,
      isActive: entry.isActive !== false,
      sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : 9999,
    };
    return acc;
  }, {});
};

export const workoutMasterMap = buildTrainingDefinitionsMap(workoutMasterEntries);

export const isWorkoutActive = (id) => workoutMasterMap[id]?.isActive !== false;

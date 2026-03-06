const DIFFICULTY_KEYS = ['beginner', 'intermediate', 'advanced'];
const CATEGORY_KEYS = ['cardio', 'bodyweight', 'weights'];
const UNIT_KEYS = ['weightReps', 'time'];

export const workoutMasterEntries = [
  {
    "id": "squats",
    "isActive": true,
    "sortOrder": 10,
    "label": "スクワット",
    "category": "bodyweight",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "下半身全体を使う自重スクワット。膝とつま先の向きを揃えて実施します。",
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
            "max": 25
          }
        },
        "points": {
          "base": 120,
          "perWork": 0.09,
          "setBonus": 8,
          "completion": 30,
          "challengeScale": 0.5
        },
        "howto": "背筋を伸ばし、かかと重心でしゃがみすぎない。"
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
            "max": 30
          }
        },
        "points": {
          "base": 170,
          "perWork": 0.11,
          "setBonus": 10,
          "completion": 40,
          "challengeScale": 0.55
        },
        "howto": "膝が内側に入らないように深さを揃える。"
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
            "max": 40
          }
        },
        "points": {
          "base": 210,
          "perWork": 0.13,
          "setBonus": 12,
          "completion": 55,
          "challengeScale": 0.6
        },
        "howto": "テンポを一定に保ち可動域を保って繰り返す。"
      }
    }
  },
  {
    "id": "push-ups",
    "isActive": true,
    "sortOrder": 20,
    "label": "腕立て伏せ",
    "category": "bodyweight",
    "muscles": [
      "chest",
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "胸・肩・上腕三頭筋を使う基本の腕立て伏せ。",
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
          "challengeScale": 0.5
        },
        "howto": "手幅は肩幅よりやや広め。"
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
          "challengeScale": 0.55
        },
        "howto": "体幹を固定して胸を床へ近づける。"
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
          "challengeScale": 0.6
        },
        "howto": "荷重を加える場合も腰が落ちないように。"
      }
    }
  },
  {
    "id": "lunges",
    "isActive": true,
    "sortOrder": 30,
    "label": "ランジ",
    "category": "weights",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "前後に足を入れ替える片脚スクワット。バランスと体幹を鍛えます。",
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
            "max": 30
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
          "challengeScale": 0.5
        },
        "howto": "骨盤を正面に向けて上下動する。"
      },
      "intermediate": {
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
          },
          {
            "weight": 4,
            "reps": 12
          }
        ],
        "maxSets": 7,
        "limits": {
          "weight": {
            "min": 0,
            "max": 50
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
          "challengeScale": 0.55
        },
        "howto": "前脚でしっかり押し返して左右差をなくす。"
      },
      "advanced": {
        "defaultSets": [
          {
            "weight": 8,
            "reps": 14
          },
          {
            "weight": 8,
            "reps": 14
          },
          {
            "weight": 8,
            "reps": 14
          },
          {
            "weight": 8,
            "reps": 14
          }
        ],
        "maxSets": 8,
        "limits": {
          "weight": {
            "min": 0,
            "max": 70
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
          "challengeScale": 0.6
        },
        "howto": "ダンベル保持でも姿勢を崩さない。"
      }
    }
  },
  {
    "id": "plank",
    "isActive": true,
    "sortOrder": 40,
    "label": "プランク",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "time",
    "description": "体幹を静的に支える種目。呼吸を止めず一直線を保ちます。",
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
          "challengeScale": 0.55
        },
        "howto": "肩の下に肘を置き一直線を維持する。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を安定させ腰が反らないようにする。"
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
            "max": 900
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
          "challengeScale": 0.65
        },
        "howto": "高負荷でも首肩に力みを入れすぎない。"
      }
    }
  },
  {
    "id": "mountain-climbers",
    "isActive": true,
    "sortOrder": 50,
    "label": "マウンテンクライマー",
    "category": "cardio",
    "muscles": [
      "core",
      "legs",
      "fullbody"
    ],
    "unit": "time",
    "description": "心拍を上げつつ体幹を使う全身運動。",
    "restSeconds": 20,
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
          "challengeScale": 0.55
        },
        "howto": "手は肩の真下に置いて行う。"
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
          "challengeScale": 0.6
        },
        "howto": "腰の高さを一定にしてテンポを維持。"
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
            "max": 900
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
          "challengeScale": 0.65
        },
        "howto": "素早くてもフォームを崩さない。"
      }
    }
  },
  {
    "id": "burpees",
    "isActive": true,
    "sortOrder": 60,
    "label": "バーピー",
    "category": "cardio",
    "muscles": [
      "fullbody",
      "legs",
      "core"
    ],
    "unit": "time",
    "description": "全身を使って心拍を高める高強度運動。",
    "restSeconds": 30,
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
          "challengeScale": 0.55
        },
        "howto": "着地を静かにして反復する。"
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
            "max": 480
          }
        },
        "points": {
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
          "challengeScale": 0.6
        },
        "howto": "キックバック時に腰を落としすぎない。"
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
            "max": 720
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
          "challengeScale": 0.65
        },
        "howto": "呼吸リズムを保って継続する。"
      }
    }
  },
  {
    "id": "walking",
    "isActive": true,
    "sortOrder": 70,
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "jogging",
    "isActive": true,
    "sortOrder": 80,
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "running",
    "isActive": true,
    "sortOrder": 90,
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "cycling",
    "isActive": true,
    "sortOrder": 100,
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "aerobics",
    "isActive": true,
    "sortOrder": 110,
    "label": "エアロビクス",
    "category": "cardio",
    "muscles": [
      "fullbody",
      "legs"
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "stretching",
    "isActive": true,
    "sortOrder": 120,
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
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "base": 150,
          "perWork": 0.5,
          "setBonus": 8,
          "completion": 35,
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "soccer",
    "isActive": true,
    "sortOrder": 130,
    "label": "サッカー",
    "category": "cardio",
    "muscles": [
      "legs",
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "basketball",
    "isActive": true,
    "sortOrder": 140,
    "label": "バスケットボール",
    "category": "cardio",
    "muscles": [
      "legs",
      "arms",
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "tennis",
    "isActive": true,
    "sortOrder": 150,
    "label": "テニス",
    "category": "cardio",
    "muscles": [
      "arms",
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "swimming",
    "isActive": true,
    "sortOrder": 160,
    "label": "水泳",
    "category": "cardio",
    "muscles": [
      "fullbody",
      "shoulders",
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "badminton",
    "isActive": true,
    "sortOrder": 170,
    "label": "バドミントン",
    "category": "cardio",
    "muscles": [
      "legs",
      "arms",
      "shoulders"
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "table-tennis",
    "isActive": true,
    "sortOrder": 180,
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
          "challengeScale": 0.55
        },
        "howto": "一定ペースで開始し、無理のない強度で行う。"
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
          "challengeScale": 0.6
        },
        "howto": "呼吸を整えながらフォームを維持する。"
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
          "challengeScale": 0.65
        },
        "howto": "長時間でも姿勢とテンポを崩さない。"
      }
    }
  },
  {
    "id": "knee-push-ups",
    "isActive": true,
    "sortOrder": 190,
    "label": "腕立て伏せ（膝付き）",
    "category": "bodyweight",
    "muscles": [
      "chest",
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "腕立て伏せ（膝付き）で自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "sit-ups",
    "isActive": true,
    "sortOrder": 200,
    "label": "腹筋",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "腹筋で自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "v-ups",
    "isActive": true,
    "sortOrder": 210,
    "label": "V字腹筋",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "V字腹筋で自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "abdominal-crunches",
    "isActive": true,
    "sortOrder": 220,
    "label": "アブドミナルクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "アブドミナルクランチで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "side-crunches",
    "isActive": true,
    "sortOrder": 230,
    "label": "サイドクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "サイドクランチで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "twist-crunches",
    "isActive": true,
    "sortOrder": 240,
    "label": "ツイストクランチ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ツイストクランチで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "leg-raises",
    "isActive": true,
    "sortOrder": 250,
    "label": "レッグレイズ",
    "category": "bodyweight",
    "muscles": [
      "core",
      "legs"
    ],
    "unit": "weightReps",
    "description": "レッグレイズで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "ab-roller",
    "isActive": true,
    "sortOrder": 260,
    "label": "アブローラー",
    "category": "bodyweight",
    "muscles": [
      "core",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "アブローラーで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "decline-sit-ups",
    "isActive": true,
    "sortOrder": 270,
    "label": "デクラインシットアップ",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "デクラインシットアップで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "jump-squats",
    "isActive": true,
    "sortOrder": 280,
    "label": "ジャンプスクワット",
    "category": "bodyweight",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "ジャンプスクワットで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "pull-ups",
    "isActive": true,
    "sortOrder": 290,
    "label": "懸垂",
    "category": "bodyweight",
    "muscles": [
      "back",
      "arms",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "懸垂で自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "side-plank",
    "isActive": true,
    "sortOrder": 300,
    "label": "サイドプランク",
    "category": "bodyweight",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "サイドプランクで自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "handstand-push-ups",
    "isActive": true,
    "sortOrder": 310,
    "label": "倒立押上",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "倒立押上で自重を使って全身を鍛える種目。",
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
          "challengeScale": 0.5
        },
        "howto": "反動を使わず丁寧に行う。"
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
          "challengeScale": 0.55
        },
        "howto": "可動域を一定に保って反復する。"
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
          "challengeScale": 0.6
        },
        "howto": "高回数でもフォームを優先する。"
      }
    }
  },
  {
    "id": "assisted-handstand-hold",
    "isActive": true,
    "sortOrder": 320,
    "label": "倒立維持（補助あり）",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "time",
    "description": "壁や補助を使って倒立姿勢を保持する種目。",
    "restSeconds": 40,
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
            "max": 240
          }
        },
        "points": {
          "base": 100,
          "perWork": 0.45,
          "setBonus": 6,
          "completion": 25,
          "challengeScale": 0.55
        },
        "howto": "壁を使って安全に姿勢を作る。"
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
          "challengeScale": 0.6
        },
        "howto": "肩をすくめず腹圧を保つ。"
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
            "max": 720
          }
        },
        "points": {
          "base": 190,
          "perWork": 0.55,
          "setBonus": 10,
          "completion": 45,
          "challengeScale": 0.65
        },
        "howto": "長時間でも一直線を維持する。"
      }
    }
  },
  {
    "id": "freestanding-handstand-hold",
    "isActive": true,
    "sortOrder": 330,
    "label": "倒立維持（補助なし）",
    "category": "bodyweight",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "time",
    "description": "補助なしで倒立姿勢の安定を高める種目。",
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
          "challengeScale": 0.55
        },
        "howto": "安全な場所で短時間から試す。"
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
          "challengeScale": 0.6
        },
        "howto": "指先で重心を調整して保持する。"
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
          "challengeScale": 0.65
        },
        "howto": "疲労時は中断し無理をしない。"
      }
    }
  },
  {
    "id": "shrug",
    "isActive": true,
    "sortOrder": 340,
    "label": "シュラッグ",
    "category": "weights",
    "muscles": [
      "back",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "シュラッグで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "bent-over-row",
    "isActive": true,
    "sortOrder": 350,
    "label": "ベントオーバーロー",
    "category": "weights",
    "muscles": [
      "back",
      "arms"
    ],
    "unit": "weightReps",
    "description": "ベントオーバーローで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "weighted-squats",
    "isActive": true,
    "sortOrder": 360,
    "label": "スクワット",
    "category": "weights",
    "muscles": [
      "legs",
      "glutes",
      "core"
    ],
    "unit": "weightReps",
    "description": "スクワットで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "deadlifts",
    "isActive": true,
    "sortOrder": 370,
    "label": "デッドリフト",
    "category": "weights",
    "muscles": [
      "back",
      "legs",
      "glutes"
    ],
    "unit": "weightReps",
    "description": "デッドリフトで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "calf-raises",
    "isActive": true,
    "sortOrder": 380,
    "label": "カーフレイズ",
    "category": "weights",
    "muscles": [
      "legs"
    ],
    "unit": "weightReps",
    "description": "カーフレイズで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "military-press",
    "isActive": true,
    "sortOrder": 390,
    "label": "ミリタリープレス",
    "category": "weights",
    "muscles": [
      "shoulders",
      "arms",
      "core"
    ],
    "unit": "weightReps",
    "description": "ミリタリープレスで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "shoulder-press",
    "isActive": true,
    "sortOrder": 400,
    "label": "ショルダープレス",
    "category": "weights",
    "muscles": [
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "ショルダープレスで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "side-raises",
    "isActive": true,
    "sortOrder": 410,
    "label": "サイドレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "サイドレイズで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "front-raises",
    "isActive": true,
    "sortOrder": 420,
    "label": "フロントレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "フロントレイズで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "lateral-raises",
    "isActive": true,
    "sortOrder": 430,
    "label": "ラタラルレイズ",
    "category": "weights",
    "muscles": [
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "ラタラルレイズで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "curls",
    "isActive": true,
    "sortOrder": 440,
    "label": "カール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "カールで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "preacher-curls",
    "isActive": true,
    "sortOrder": 450,
    "label": "プリーチャーカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "プリーチャーカールで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "wrist-curls",
    "isActive": true,
    "sortOrder": 460,
    "label": "リストカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "リストカールで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "reverse-wrist-curls",
    "isActive": true,
    "sortOrder": 470,
    "label": "リバースリストカール",
    "category": "weights",
    "muscles": [
      "arms"
    ],
    "unit": "weightReps",
    "description": "リバースリストカールで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "bench-press",
    "isActive": true,
    "sortOrder": 480,
    "label": "ベンチプレス",
    "category": "weights",
    "muscles": [
      "chest",
      "arms",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "ベンチプレスで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "incline-bench-press",
    "isActive": true,
    "sortOrder": 490,
    "label": "インクラインベンチプレス",
    "category": "weights",
    "muscles": [
      "chest",
      "shoulders",
      "arms"
    ],
    "unit": "weightReps",
    "description": "インクラインベンチプレスで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "fly",
    "isActive": true,
    "sortOrder": 500,
    "label": "フライ",
    "category": "weights",
    "muscles": [
      "chest",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "フライで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "weighted-abdominal-crunches",
    "isActive": true,
    "sortOrder": 510,
    "label": "アブドミナルクランチ",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "アブドミナルクランチで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "cable-woodchops",
    "isActive": true,
    "sortOrder": 520,
    "label": "ケーブルウッドチョップ",
    "category": "weights",
    "muscles": [
      "core",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "ケーブルウッドチョップで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "cable-crunches",
    "isActive": true,
    "sortOrder": 530,
    "label": "ケーブルクランチ",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ケーブルクランチで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "cable-side-bends",
    "isActive": true,
    "sortOrder": 540,
    "label": "ケーブルサイドベント",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ケーブルサイドベントで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "rotary-torso",
    "isActive": true,
    "sortOrder": 550,
    "label": "ロータリートルソー",
    "category": "weights",
    "muscles": [
      "core"
    ],
    "unit": "weightReps",
    "description": "ロータリートルソーで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  },
  {
    "id": "triceps-extension",
    "isActive": true,
    "sortOrder": 560,
    "label": "トライセップスエクステンション",
    "category": "weights",
    "muscles": [
      "arms",
      "shoulders"
    ],
    "unit": "weightReps",
    "description": "トライセップスエクステンションで狙った部位に負荷をかけるウエイト種目。",
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
          "challengeScale": 0.5
        },
        "howto": "軽重量で可動域を確認する。"
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
          "challengeScale": 0.55
        },
        "howto": "呼吸を合わせて反復をそろえる。"
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
          "challengeScale": 0.6
        },
        "howto": "反動を抑えて対象筋に効かせる。"
      }
    }
  }
];

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

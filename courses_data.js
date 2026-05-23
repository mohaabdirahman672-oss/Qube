// MathHelper Courses - Complete Catalogue
// Contains all 29 courses with lesson metadata and practice questions
// Each lesson includes Easy, Medium, and Hard practice items

const COURSES = [
  {
    "id": "arithmetic",
    "title": "Arithmetic Fundamentals",
    "level": "Beginner",
    "color": "#06B6D4",
    "icon": "➕",
    "lessons": [
      {
        "id": "arith_l1",
        "title": "Addition & Subtraction",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Calculate: 583 + 274 − 136",
            "answer": "721"
          },
          {
            "difficulty": "Medium",
            "question": "A shop had 1,240 items. They sold 378 on Monday and received 215 new items. How many items do they have now?",
            "answer": "1,077 items"
          },
          {
            "difficulty": "Hard",
            "question": "Find x: x − (425 + 178) = 312",
            "answer": "x = 915"
          }
        ]
      },
      {
        "id": "arith_l2",
        "title": "Multiplication & Division",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A factory produces 36 toys per hour. How many toys are made in an 8-hour shift?",
            "answer": "288 toys"
          },
          {
            "difficulty": "Medium",
            "question": "252 students are split equally into 9 classrooms. How many students are in each classroom?",
            "answer": "28 students"
          },
          {
            "difficulty": "Hard",
            "question": "A number multiplied by 7, then divided by 4, gives 49. What is the number?",
            "answer": "28"
          }
        ]
      },
      {
        "id": "arith_l3",
        "title": "Order of Operations (PEMDAS)",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: 10 + 4 × 3",
            "answer": "22"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: (8 − 3)² + 12 ÷ 4 × 2",
            "answer": "31"
          },
          {
            "difficulty": "Hard",
            "question": "Insert one pair of parentheses to make this true: 6 + 4 × 3 − 1 = 29",
            "answer": "6 + 4 × (3 − 1) = ... that gives 6+8=14. Try: (6 + 4) × 3 − 1 = 29"
          }
        ]
      },
      {
        "id": "arith_l4",
        "title": "Factors, Multiples & Primes",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "List all factors of 36.",
            "answer": "1, 2, 3, 4, 6, 9, 12, 18, 36"
          },
          {
            "difficulty": "Medium",
            "question": "Find the GCF and LCM of 24 and 36.",
            "answer": "GCF = 12, LCM = 72"
          },
          {
            "difficulty": "Hard",
            "question": "Is 127 prime? Show your reasoning.",
            "answer": "Yes, 127 is prime."
          }
        ]
      },
      {
        "id": "arith_l5",
        "title": "Place Value & Rounding",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Round 7,463 to the nearest hundred.",
            "answer": "7,500"
          },
          {
            "difficulty": "Medium",
            "question": "Round 3.8472 to: (a) nearest tenth, (b) nearest hundredth.",
            "answer": "(a) 3.8, (b) 3.85"
          },
          {
            "difficulty": "Hard",
            "question": "A number rounds to 4,600 to the nearest hundred. What are the smallest and largest possible values?",
            "answer": "Smallest: 4,550 — Largest: 4,649"
          }
        ]
      },
      {
        "id": "arith_l6",
        "title": "Negative Numbers",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Calculate: (−6) + (−9)",
            "answer": "−15"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: (−3) × (−4) − (−2) × 5",
            "answer": "22"
          },
          {
            "difficulty": "Hard",
            "question": "The temperature was −8°C at midnight. It rose 3°C every hour for 5 hours, then dropped 7°C. What is the final temperature?",
            "answer": "0°C"
          }
        ]
      }
    ]
  },
  {
    "id": "fractions",
    "title": "Fractions, Decimals & Percentages",
    "level": "Beginner",
    "color": "#F97316",
    "icon": "½",
    "lessons": [
      {
        "id": "frac_l1",
        "title": "What Is a Fraction?",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify 18/24 to its lowest terms.",
            "answer": "3/4"
          },
          {
            "difficulty": "Medium",
            "question": "Write 2¾ as an improper fraction.",
            "answer": "11/4"
          },
          {
            "difficulty": "Hard",
            "question": "List three fractions equivalent to 4/6, and identify which is in simplest form.",
            "answer": "2/3 (simplest), 8/12, 12/18, etc."
          }
        ]
      },
      {
        "id": "frac_l2",
        "title": "Adding & Subtracting Fractions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Calculate: 1/4 + 3/4",
            "answer": "1"
          },
          {
            "difficulty": "Medium",
            "question": "Calculate: 5/6 − 1/4",
            "answer": "7/12"
          },
          {
            "difficulty": "Hard",
            "question": "Calculate: 3½ + 2¾ − 1⅙",
            "answer": "5 1/12"
          }
        ]
      },
      {
        "id": "frac_l3",
        "title": "Multiplying & Dividing Fractions",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Calculate: 2/3 × 3/4",
            "answer": "1/2"
          },
          {
            "difficulty": "Medium",
            "question": "Calculate: 5/8 ÷ 5/12",
            "answer": "3/2 = 1½"
          },
          {
            "difficulty": "Hard",
            "question": "A recipe needs 2/3 cup of sugar. If you want to make 1½ times the recipe, how much sugar do you need?",
            "answer": "1 cup"
          }
        ]
      },
      {
        "id": "frac_l4",
        "title": "Decimals & Conversions",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Convert 3/5 to a decimal and a percentage.",
            "answer": "0.6 = 60%"
          },
          {
            "difficulty": "Medium",
            "question": "Convert 0.625 to a fraction in simplest form.",
            "answer": "5/8"
          },
          {
            "difficulty": "Hard",
            "question": "Write 0.̄3̄6̄ (0.363636...) as a fraction.",
            "answer": "4/11"
          }
        ]
      },
      {
        "id": "frac_l5",
        "title": "Percentages",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "What is 35% of 200?",
            "answer": "70"
          },
          {
            "difficulty": "Medium",
            "question": "42 out of 56 students passed a test. What percentage passed?",
            "answer": "75%"
          },
          {
            "difficulty": "Hard",
            "question": "A price increased from $80 to $92. What was the percentage increase? Then it dropped back to $80. What was the percentage decrease from $92?",
            "answer": "Increase: 15%. Decrease: 13.04%"
          }
        ]
      },
      {
        "id": "frac_l6",
        "title": "Ratio & Proportion Preview",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify the ratio 45:30.",
            "answer": "3:2"
          },
          {
            "difficulty": "Medium",
            "question": "A car travels 180 km in 3 hours. At the same rate, how far will it travel in 5 hours?",
            "answer": "300 km"
          },
          {
            "difficulty": "Hard",
            "question": "A map has a scale of 1:25,000. Two towns are 8.4 cm apart on the map. What is the real distance in km?",
            "answer": "2.1 km"
          }
        ]
      }
    ]
  },
  {
    "id": "intro_algebra",
    "title": "Introduction to Algebra",
    "level": "Beginner",
    "color": "#6C63FF",
    "icon": "x",
    "lessons": [
      {
        "id": "ialg_l1",
        "title": "Variables & Expressions",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate 5x − 3 when x = 4.",
            "answer": "17"
          },
          {
            "difficulty": "Medium",
            "question": "Simplify: 3x + 5 − x + 2x − 8",
            "answer": "4x − 3"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate 2a² − 3ab + b² when a = 3 and b = −2.",
            "answer": "31"
          }
        ]
      },
      {
        "id": "ialg_l2",
        "title": "Solving One-Step Equations",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: x + 14 = 31",
            "answer": "x = 17"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: x/7 = −4",
            "answer": "x = −28"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 3x − 5 = x + 11",
            "answer": "x = 8"
          }
        ]
      },
      {
        "id": "ialg_l3",
        "title": "Solving Two-Step Equations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 2x + 6 = 14",
            "answer": "x = 4"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: (x/3) − 5 = −1",
            "answer": "x = 12"
          },
          {
            "difficulty": "Hard",
            "question": "Sam earns $15/hour plus a $25 bonus per shift. He earned $190 in one shift. How many hours did he work?",
            "answer": "11 hours"
          }
        ]
      },
      {
        "id": "ialg_l4",
        "title": "Inequalities",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: x + 5 > 9",
            "answer": "x > 4"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: −4x ≤ 20",
            "answer": "x ≥ −5"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 2(x − 3) > 4x − 2",
            "answer": "x < −2"
          }
        ]
      },
      {
        "id": "ialg_l5",
        "title": "Introduction to Graphing",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In which quadrant does the point (−3, 5) lie?",
            "answer": "Quadrant II"
          },
          {
            "difficulty": "Medium",
            "question": "Find the midpoint between (2, −4) and (8, 6).",
            "answer": "(5, 1)"
          },
          {
            "difficulty": "Hard",
            "question": "Point A is at (1, 3). Point B is the reflection of A over the y-axis. Point C is the reflection of B over the x-axis. What are the coordinates of C?",
            "answer": "C = (−1, −3)"
          }
        ]
      },
      {
        "id": "ialg_l6",
        "title": "Writing & Solving Word Problems",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A number is doubled then increased by 7, giving 23. What is the number?",
            "answer": "8"
          },
          {
            "difficulty": "Medium",
            "question": "Three consecutive even numbers sum to 78. Find them.",
            "answer": "24, 26, 28"
          },
          {
            "difficulty": "Hard",
            "question": "Tickets cost $8 for adults and $5 for children. 200 tickets were sold for $1,285. How many of each type were sold?",
            "answer": "95 adult, 105 child"
          }
        ]
      }
    ]
  },
  {
    "id": "basic_geometry",
    "title": "Basic Geometry",
    "level": "Beginner",
    "color": "#43D9AD",
    "icon": "△",
    "lessons": [
      {
        "id": "geo_l1",
        "title": "Angles & Lines",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Two angles are complementary. One measures 34°. Find the other.",
            "answer": "56°"
          },
          {
            "difficulty": "Medium",
            "question": "Two supplementary angles are in the ratio 4:5. Find each angle.",
            "answer": "80° and 100°"
          },
          {
            "difficulty": "Hard",
            "question": "Two parallel lines are cut by a transversal. One co-interior (same-side interior) angle is 3x + 15°. The other is 2x + 25°. Find both angles.",
            "answer": "87° and 93°"
          }
        ]
      },
      {
        "id": "geo_l2",
        "title": "Triangles & Quadrilaterals",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A triangle has angles 55° and 72°. Find the third angle.",
            "answer": "53°"
          },
          {
            "difficulty": "Medium",
            "question": "An isosceles triangle has a vertex angle of 40°. Find the two base angles.",
            "answer": "70° each"
          },
          {
            "difficulty": "Hard",
            "question": "A quadrilateral has angles 2x, 3x, 4x, and 5x. Find each angle and identify the quadrilateral type.",
            "answer": "50°, 75°, 100°, 135° — a general (scalene) quadrilateral"
          }
        ]
      },
      {
        "id": "geo_l3",
        "title": "Circles",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A circle has radius 5 cm. Find its area. (Leave answer in terms of π)",
            "answer": "25π cm²"
          },
          {
            "difficulty": "Medium",
            "question": "A circular track has circumference 314 m. Find its radius. (Use π ≈ 3.14)",
            "answer": "50 m"
          },
          {
            "difficulty": "Hard",
            "question": "A semicircle sits on top of a rectangle. The rectangle is 10 cm wide and 6 cm tall. Find the total perimeter.",
            "answer": "≈ 47.7 cm"
          }
        ]
      },
      {
        "id": "geo_l4",
        "title": "Perimeter & Area of Polygons",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the area of a triangle with base 12 cm and height 9 cm.",
            "answer": "54 cm²"
          },
          {
            "difficulty": "Medium",
            "question": "A trapezoid has parallel sides of 8 m and 14 m, and a height of 6 m. Find its area.",
            "answer": "66 m²"
          },
          {
            "difficulty": "Hard",
            "question": "A square has a triangle cut from one corner. The square is 10 cm wide. The triangle has base 4 cm and height 4 cm. Find the remaining area.",
            "answer": "92 cm²"
          }
        ]
      },
      {
        "id": "geo_l5",
        "title": "Surface Area & Volume",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the volume of a box that is 5 cm × 4 cm × 3 cm.",
            "answer": "60 cm³"
          },
          {
            "difficulty": "Medium",
            "question": "A cylinder has radius 6 cm and height 10 cm. Find its volume. (Leave in terms of π)",
            "answer": "360π cm³"
          },
          {
            "difficulty": "Hard",
            "question": "A sphere fits exactly inside a cube with side 8 cm. What fraction of the cube's volume does the sphere occupy? (Use π ≈ 3.14)",
            "answer": "≈ 52.3%"
          }
        ]
      },
      {
        "id": "geo_l6",
        "title": "The Pythagorean Theorem",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A right triangle has legs 9 cm and 12 cm. Find the hypotenuse.",
            "answer": "15 cm"
          },
          {
            "difficulty": "Medium",
            "question": "A 13-metre ladder rests against a wall. The base is 5 m from the wall. How high up the wall does it reach?",
            "answer": "12 m"
          },
          {
            "difficulty": "Hard",
            "question": "Find the distance between points A(1, 2) and B(7, 10).",
            "answer": "10 units"
          }
        ]
      }
    ]
  },
  {
    "id": "intro_stats",
    "title": "Introduction to Statistics & Data",
    "level": "Beginner",
    "color": "#EC4899",
    "icon": "📊",
    "lessons": [
      {
        "id": "stats_l1",
        "title": "Mean, Median, Mode & Range",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the mean of: 12, 15, 9, 18, 6",
            "answer": "Mean = 12"
          },
          {
            "difficulty": "Medium",
            "question": "Data: 3, 7, 7, 8, 10, 12. Find the median.",
            "answer": "Median = 7.5"
          },
          {
            "difficulty": "Hard",
            "question": "The mean of 5 numbers is 14. Four of them are 10, 12, 18, 16. Find the fifth number.",
            "answer": "14"
          }
        ]
      },
      {
        "id": "stats_l2",
        "title": "Graphs & Data Displays",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A bar chart shows: Maths 25, English 18, Science 22, History 15. What is the total number of students?",
            "answer": "80 students"
          },
          {
            "difficulty": "Medium",
            "question": "In the bar chart above, what percentage of students chose Maths?",
            "answer": "31.25%"
          },
          {
            "difficulty": "Hard",
            "question": "Scores: 45, 52, 67, 71, 74, 78, 82, 85, 91, 94. Build a frequency table using intervals 40–59, 60–79, 80–99. Which interval has the highest frequency?",
            "answer": "60–79 has highest frequency (4 values)"
          }
        ]
      },
      {
        "id": "stats_l3",
        "title": "Probability Basics",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Roll a fair six-sided die. What is P(rolling a 4)?",
            "answer": "1/6"
          },
          {
            "difficulty": "Medium",
            "question": "A bag has 4 red, 3 blue, 2 green marbles. What is P(not red)?",
            "answer": "5/9"
          },
          {
            "difficulty": "Hard",
            "question": "A card is drawn from a standard 52-card deck. What is P(King OR Heart)?",
            "answer": "4/13"
          }
        ]
      },
      {
        "id": "stats_l4",
        "title": "Box Plots & Five-Number Summary",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Data: 5, 8, 12, 15, 20. Find Q1, Q3, and IQR.",
            "answer": "Q1=8, Q3=15, IQR=7"
          },
          {
            "difficulty": "Medium",
            "question": "Using the outlier rule (1.5×IQR), determine if 35 is an outlier when Q1=10 and Q3=25.",
            "answer": "Yes, 35 is an outlier"
          },
          {
            "difficulty": "Hard",
            "question": "Two datasets have the same mean of 50. Dataset A: IQR=8. Dataset B: IQR=30. What does this tell us about the datasets?",
            "answer": "Dataset B is much more spread out; Dataset A is tightly clustered around the mean."
          }
        ]
      },
      {
        "id": "stats_l5",
        "title": "Scatter Plots & Correlation",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A scatter plot shows that as temperature rises, ice cream sales increase. Is this positive or negative correlation?",
            "answer": "Positive correlation"
          },
          {
            "difficulty": "Medium",
            "question": "r = −0.92 for a dataset. Describe the strength and direction of the relationship.",
            "answer": "Strong negative linear correlation"
          },
          {
            "difficulty": "Hard",
            "question": "\"Ice cream sales and drowning rates are positively correlated. Does ice cream cause drowning?\" Explain the flaw.",
            "answer": "No — lurking variable: hot weather increases both independently."
          }
        ]
      },
      {
        "id": "stats_l6",
        "title": "Interpreting Data & Drawing Conclusions",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A poll surveys 100 students at a school cafeteria about their favourite food. Is this a good sample for the whole school?",
            "answer": "No — it only captures students who eat in the cafeteria, causing selection bias."
          },
          {
            "difficulty": "Medium",
            "question": "A study finds people who read more books earn more money. Can we conclude that reading causes higher income?",
            "answer": "No — correlation does not imply causation. Confounding variables may explain both."
          },
          {
            "difficulty": "Hard",
            "question": "Design a fair study to test whether a new study app improves test scores. Identify potential sources of bias.",
            "answer": "Random assignment to app/no-app groups; control for prior knowledge; blind evaluation. Biases: self-selection, placebo effect, measurement bias."
          }
        ]
      }
    ]
  },
  {
    "id": "ratios",
    "title": "Ratios, Rates & Proportions",
    "level": "Beginner",
    "color": "#FFB830",
    "icon": "÷",
    "lessons": [
      {
        "id": "rat_l1",
        "title": "Ratios & Their Forms",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify the ratio 56:72.",
            "answer": "7:9"
          },
          {
            "difficulty": "Medium",
            "question": "A smoothie uses orange juice and mango juice in the ratio 3:2. If you use 450 ml of orange juice, how much mango juice do you need?",
            "answer": "300 ml"
          },
          {
            "difficulty": "Hard",
            "question": "Three friends share a prize in the ratio 2:3:5. The largest share is $150. What is the total prize?",
            "answer": "$300"
          }
        ]
      },
      {
        "id": "rat_l2",
        "title": "Unit Rates & Speed",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Store A sells 5 pens for $3.50. Store B sells 8 pens for $5.60. Which is better value?",
            "answer": "Same price — both cost $0.70 per pen"
          },
          {
            "difficulty": "Medium",
            "question": "A train travels 360 km in 2.5 hours. What is its average speed in km/h?",
            "answer": "144 km/h"
          },
          {
            "difficulty": "Hard",
            "question": "Ali drives 120 km at 60 km/h, then 80 km at 40 km/h. What is his average speed for the whole journey?",
            "answer": "50 km/h"
          }
        ]
      },
      {
        "id": "rat_l3",
        "title": "Proportions & Scale",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 3/7 = x/35",
            "answer": "x = 15"
          },
          {
            "difficulty": "Medium",
            "question": "A model car is built at a scale of 1:20. The model is 18 cm long. How long is the real car in metres?",
            "answer": "3.6 m"
          },
          {
            "difficulty": "Hard",
            "question": "Two similar triangles have a scale factor of 3:5. The area of the smaller triangle is 27 cm². Find the area of the larger triangle.",
            "answer": "75 cm²"
          }
        ]
      },
      {
        "id": "rat_l4",
        "title": "Percent Increase & Decrease",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A phone costs $320 and is on sale with 25% off. Find the sale price.",
            "answer": "$240"
          },
          {
            "difficulty": "Medium",
            "question": "A stock rose from $50 to $65. What was the percentage increase?",
            "answer": "30%"
          },
          {
            "difficulty": "Hard",
            "question": "A price increases by 20% then decreases by 20%. Is the final price the same as the original? Show why.",
            "answer": "No — final price is 96% of original (4% less)"
          }
        ]
      },
      {
        "id": "rat_l5",
        "title": "Simple Interest",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Calculate simple interest on $500 at 6% per year for 2 years.",
            "answer": "$60"
          },
          {
            "difficulty": "Medium",
            "question": "You borrow $1,800 and repay $2,070 after 18 months. What was the annual simple interest rate?",
            "answer": "10% per year"
          },
          {
            "difficulty": "Hard",
            "question": "How long (in years) will it take $2,000 to grow to $2,600 at 5% simple interest per year?",
            "answer": "6 years"
          }
        ]
      },
      {
        "id": "rat_l6",
        "title": "Tax, Tip & Discount",
        "duration": "8 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A shirt costs $40 and is 25% off. What is the sale price?",
            "answer": "$30"
          },
          {
            "difficulty": "Medium",
            "question": "A restaurant bill is $60. You tip 20% and pay 8% sales tax. What is the total?",
            "answer": "$77.28"
          },
          {
            "difficulty": "Hard",
            "question": "A jacket is marked up 40% from its $85 cost price, then put on sale 30% off the retail price. What is the final price and the net % discount from cost?",
            "answer": "$83.30; about 2% below cost"
          }
        ]
      }
    ]
  },
  {
    "id": "number_theory",
    "title": "Number Theory Essentials",
    "level": "Beginner",
    "color": "#8B5CF6",
    "icon": "ℤ",
    "lessons": [
      {
        "id": "nt_l1",
        "title": "Divisibility Rules",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Is 3,456 divisible by 3? Show your reasoning.",
            "answer": "Yes — digit sum 3+4+5+6=18, divisible by 3"
          },
          {
            "difficulty": "Medium",
            "question": "Which of these is divisible by 6? A) 5,124  B) 7,230  C) 4,315",
            "answer": "A and B"
          },
          {
            "difficulty": "Hard",
            "question": "Find the largest 4-digit number divisible by 2, 3, 5, and 9.",
            "answer": "9,990"
          }
        ]
      },
      {
        "id": "nt_l2",
        "title": "Prime Factorization",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the prime factorization of 72.",
            "answer": "2³ × 3²"
          },
          {
            "difficulty": "Medium",
            "question": "Find the GCF and LCM of 84 and 126.",
            "answer": "GCF = 42, LCM = 252"
          },
          {
            "difficulty": "Hard",
            "question": "How many factors does 2³ × 3² × 5 have in total?",
            "answer": "24 factors"
          }
        ]
      },
      {
        "id": "nt_l3",
        "title": "Patterns & Sequences",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the 8th term of the arithmetic sequence: 7, 12, 17, 22, …",
            "answer": "42"
          },
          {
            "difficulty": "Medium",
            "question": "Find the 6th term of the geometric sequence: 3, 6, 12, 24, …",
            "answer": "96"
          },
          {
            "difficulty": "Hard",
            "question": "An arithmetic sequence has a₃ = 11 and a₇ = 27. Find a₁ and the common difference.",
            "answer": "a₁ = 3, d = 4"
          }
        ]
      },
      {
        "id": "nt_l4",
        "title": "Exponents & Powers",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify: 5³ × 5²",
            "answer": "5⁵ = 3,125"
          },
          {
            "difficulty": "Medium",
            "question": "Simplify: (3²)³ ÷ 3⁴",
            "answer": "3² = 9"
          },
          {
            "difficulty": "Hard",
            "question": "Simplify: (2³ × 4²) / (8 × 2²)",
            "answer": "4"
          }
        ]
      },
      {
        "id": "nt_l5",
        "title": "Square Roots & Cube Roots",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify √144",
            "answer": "12"
          },
          {
            "difficulty": "Medium",
            "question": "Simplify √200",
            "answer": "10√2"
          },
          {
            "difficulty": "Hard",
            "question": "Simplify: √75 + 2√27 − √12",
            "answer": "9√3"
          }
        ]
      },
      {
        "id": "nt_l6",
        "title": "Scientific Notation",
        "duration": "9 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write 0.00047 in scientific notation.",
            "answer": "4.7 × 10⁻⁴"
          },
          {
            "difficulty": "Medium",
            "question": "Calculate (6.0 × 10⁸) ÷ (2.4 × 10³). Express your answer in scientific notation.",
            "answer": "2.5 × 10⁵"
          },
          {
            "difficulty": "Hard",
            "question": "Add: (3.5 × 10⁶) + (8.2 × 10⁵). Express in scientific notation.",
            "answer": "4.32 × 10⁶"
          }
        ]
      }
    ]
  },
  {
    "id": "prealgebra_mastery",
    "title": "Pre-Algebra Mastery",
    "level": "Intermediate",
    "color": "#06B6D4",
    "icon": "∝",
    "lessons": [
      {
        "id": "pam_l1",
        "title": "Multi-Step & Variable-on-Both-Sides",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 4x + 7 = 2x + 19",
            "answer": "x = 6"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 5(2x − 3) = 3x + 6",
            "answer": "x = 3"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 2(3x + 1) − 4(x − 2) = 3(x − 1) + 5",
            "answer": "x = 8"
          }
        ]
      },
      {
        "id": "pam_l2",
        "title": "Compound Inequalities",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 3 < x + 5 ≤ 10",
            "answer": "−2 < x ≤ 5"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: x > 4 OR x < −1. Write in interval notation.",
            "answer": "(−∞, −1) ∪ (4, +∞)"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: −3 ≤ (2x − 1)/3 < 5. Write in interval notation.",
            "answer": "[−4, 8)"
          }
        ]
      },
      {
        "id": "pam_l3",
        "title": "Absolute Value Equations & Inequalities",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: |x − 4| = 7",
            "answer": "x = 11 or x = −3"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: |2x + 3| < 9",
            "answer": "−6 < x < 3"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: |4x − 1| ≥ 11",
            "answer": "x ≤ −5/2 or x ≥ 3"
          }
        ]
      },
      {
        "id": "pam_l4",
        "title": "Introduction to Functions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Given f(x) = 3x − 5, find f(4).",
            "answer": "7"
          },
          {
            "difficulty": "Medium",
            "question": "Given h(x) = x² + 2x − 3, find h(−2) and h(3).",
            "answer": "h(−2) = −3; h(3) = 12"
          },
          {
            "difficulty": "Hard",
            "question": "Given f(x) = 2x + 1 and g(x) = x² − 4, find f(g(3)) and g(f(−1)).",
            "answer": "f(g(3)) = 11; g(f(−1)) = −3"
          }
        ]
      },
      {
        "id": "pam_l5",
        "title": "Linear Functions & Slope",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the slope of the line through (1, 3) and (5, 11).",
            "answer": "m = 2"
          },
          {
            "difficulty": "Medium",
            "question": "Write the equation of the line with slope 3 passing through (−2, 1).",
            "answer": "y = 3x + 7"
          },
          {
            "difficulty": "Hard",
            "question": "The line through (a, 2) and (4, −1) has slope −3/2. Find a.",
            "answer": "a = 2"
          }
        ]
      },
      {
        "id": "pam_l6",
        "title": "Direct & Inverse Variation",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "y varies directly with x. When x = 5, y = 20. Find y when x = 8.",
            "answer": "y = 32"
          },
          {
            "difficulty": "Medium",
            "question": "y varies inversely with x. When x = 3, y = 12. Find x when y = 4.",
            "answer": "x = 9"
          },
          {
            "difficulty": "Hard",
            "question": "z varies jointly with x and y. When x=2 and y=5, z=30. Find z when x=4 and y=3.",
            "answer": "z = 36"
          }
        ]
      }
    ]
  },
  {
    "id": "linear_equations",
    "title": "Linear Equations & Graphing",
    "level": "Intermediate",
    "color": "#6C63FF",
    "icon": "/",
    "lessons": [
      {
        "id": "lin_l1",
        "title": "Three Forms of a Linear Equation",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Convert y = −4x + 5 to standard form.",
            "answer": "4x + y = 5"
          },
          {
            "difficulty": "Medium",
            "question": "Write the equation (in slope-intercept form) of the line through (−1, 4) and (3, −4).",
            "answer": "y = −2x + 2"
          },
          {
            "difficulty": "Hard",
            "question": "Line L passes through (2, 3) and has x-intercept at (5, 0). Write L in all three forms.",
            "answer": "Slope-intercept: y=−x+5; Point-slope: y−3=−1(x−2); Standard: x+y=5"
          }
        ]
      },
      {
        "id": "lin_l2",
        "title": "Parallel & Perpendicular Lines",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Are y = 4x − 3 and y = 4x + 7 parallel, perpendicular, or neither?",
            "answer": "Parallel (same slope m=4)"
          },
          {
            "difficulty": "Medium",
            "question": "Write the equation of the line perpendicular to y = (2/3)x − 1 that passes through (4, 1).",
            "answer": "y = −(3/2)x + 7"
          },
          {
            "difficulty": "Hard",
            "question": "Find the equation of the perpendicular bisector of the segment from A(1, 3) to B(5, 7).",
            "answer": "y = −x + 8"
          }
        ]
      },
      {
        "id": "lin_l3",
        "title": "Linear Regression & Line of Best Fit",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "The regression line is y = 5x + 20. Predict y when x = 6.",
            "answer": "y = 50"
          },
          {
            "difficulty": "Medium",
            "question": "A data point is (4, 38). The regression line gives y = 5(4) + 20 = 40. What is the residual?",
            "answer": "Residual = −2"
          },
          {
            "difficulty": "Hard",
            "question": "Two regression lines are proposed: L1: y = 3x + 10 and L2: y = 4x + 5. For the data points (2,16), (4,26), (6,30), which line has a smaller total absolute residual?",
            "answer": "L1 is better (total residual = 6 vs 9 for L2)"
          }
        ]
      },
      {
        "id": "lin_l4",
        "title": "Solving by Graphing & Substitution",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve by substitution: x = 3y and 2x + y = 21",
            "answer": "x = 9, y = 3"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 2x + y = 8 and y = 3x − 7",
            "answer": "x = 3, y = 2"
          },
          {
            "difficulty": "Hard",
            "question": "The sum of two numbers is 54. One number is 6 more than twice the other. Find both numbers.",
            "answer": "38 and 16"
          }
        ]
      },
      {
        "id": "lin_l5",
        "title": "Solving by Elimination",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve by elimination: x + y = 10 and x − y = 4",
            "answer": "x = 7, y = 3"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 3x + 2y = 16 and 5x − 2y = 24",
            "answer": "x = 5, y = 1/2"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 4x + 3y = 1 and 6x − 5y = 11",
            "answer": "x = 1, y = −1"
          }
        ]
      },
      {
        "id": "lin_l6",
        "title": "Systems Word Problems",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "The sum of two numbers is 30 and their difference is 8. Find both numbers.",
            "answer": "19 and 11"
          },
          {
            "difficulty": "Medium",
            "question": "A boat travels 36 km downstream in 3 hours and 24 km upstream in 4 hours. Find the speed of the boat in still water and the current speed.",
            "answer": "Boat: 9 km/h, Current: 3 km/h"
          },
          {
            "difficulty": "Hard",
            "question": "A chemist mixes a 30% acid solution with a 70% acid solution to get 100 mL of 50% acid. How many mL of each?",
            "answer": "50 mL of each"
          }
        ]
      }
    ]
  },
  {
    "id": "quadratics",
    "title": "Quadratic Functions",
    "level": "Intermediate",
    "color": "#F97316",
    "icon": "U",
    "lessons": [
      {
        "id": "quad_l1",
        "title": "Factoring Quadratics",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve by factoring: x² + 3x − 10 = 0",
            "answer": "x = 2 or x = −5"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 2x² − 7x + 3 = 0 by factoring.",
            "answer": "x = 3 or x = 1/2"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 3x² − 48 = 0",
            "answer": "x = 4 or x = −4"
          }
        ]
      },
      {
        "id": "quad_l2",
        "title": "Completing the Square",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Complete the square: what value of c makes x² − 8x + c a perfect square trinomial?",
            "answer": "c = 16"
          },
          {
            "difficulty": "Medium",
            "question": "Solve by completing the square: x² + 4x − 12 = 0",
            "answer": "x = 2 or x = −6"
          },
          {
            "difficulty": "Hard",
            "question": "Write y = 2x² − 12x + 11 in vertex form and state the vertex.",
            "answer": "y = 2(x−3)² − 7; vertex (3, −7)"
          }
        ]
      },
      {
        "id": "quad_l3",
        "title": "The Quadratic Formula & Discriminant",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the discriminant of x² − 6x + 9 = 0. How many real roots does it have?",
            "answer": "Δ = 0; one repeated real root"
          },
          {
            "difficulty": "Medium",
            "question": "Solve using the quadratic formula: x² − 5x + 3 = 0",
            "answer": "x = (5 ± √13)/2"
          },
          {
            "difficulty": "Hard",
            "question": "For what value(s) of k does 3x² + kx + 3 = 0 have exactly one real solution?",
            "answer": "k = 6 or k = −6"
          }
        ]
      },
      {
        "id": "quad_l4",
        "title": "Graphing Parabolas",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the vertex and axis of symmetry of y = x² − 6x + 8.",
            "answer": "Vertex (3, −1); axis x = 3"
          },
          {
            "difficulty": "Medium",
            "question": "Does y = −2x² + 8x − 5 open up or down? Find the maximum value.",
            "answer": "Opens down; maximum y = 3"
          },
          {
            "difficulty": "Hard",
            "question": "A parabola has vertex (1, −4) and passes through (3, 0). Write its equation in vertex form and standard form.",
            "answer": "y = (x−1)² − 4; y = x² − 2x − 3"
          }
        ]
      },
      {
        "id": "quad_l5",
        "title": "Quadratic Applications",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A ball is dropped from rest at 64 ft. Its height is h(t) = −16t² + 64. When does it hit the ground?",
            "answer": "t = 2 seconds"
          },
          {
            "difficulty": "Medium",
            "question": "A farmer has 80 m of fencing to enclose a rectangular area against a barn wall (no fencing needed on that side). What dimensions maximise the area?",
            "answer": "20 m × 40 m = 800 m²"
          },
          {
            "difficulty": "Hard",
            "question": "A ball is launched upward from 5 m height at 30 m/s: h(t) = −5t² + 30t + 5. Find the maximum height and the time it lands (to 2 decimal places).",
            "answer": "Max height = 50 m at t = 3 s; lands at t ≈ 6.16 s"
          }
        ]
      },
      {
        "id": "quad_l6",
        "title": "Quadratic Inequalities",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: x² − 9 > 0",
            "answer": "x < −3 or x > 3"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: x² − 2x − 8 ≤ 0",
            "answer": "−2 ≤ x ≤ 4"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 2x² + x − 6 < 0",
            "answer": "−2 < x < 3/2"
          }
        ]
      }
    ]
  },
  {
    "id": "euclidean_geometry",
    "title": "Euclidean Geometry",
    "level": "Intermediate",
    "color": "#43D9AD",
    "icon": "⬡",
    "lessons": [
      {
        "id": "eg_l1",
        "title": "Triangle Congruence",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Two triangles have sides 3, 4, 5 and 3, 4, 5. Are they congruent? Which criterion applies?",
            "answer": "Yes — SSS"
          },
          {
            "difficulty": "Medium",
            "question": "In △ABC and △DEF, ∠A = ∠D = 50°, ∠B = ∠E = 70°, and AB = DE = 8 cm. Are the triangles congruent? Which criterion?",
            "answer": "Yes — ASA"
          },
          {
            "difficulty": "Hard",
            "question": "M is the midpoint of both AC and BD (diagonals of quadrilateral ABCD). Prove △AMB ≅ △CMD and name the criterion.",
            "answer": "SAS — AM=CM, BM=DM (midpoint), ∠AMB=∠CMD (vertical angles)"
          }
        ]
      },
      {
        "id": "eg_l2",
        "title": "Similar Triangles",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Two similar triangles have scale factor 3:5. If the smaller triangle has a side of 9 cm, what is the corresponding side of the larger?",
            "answer": "15 cm"
          },
          {
            "difficulty": "Medium",
            "question": "Two similar rectangles have perimeters 24 cm and 36 cm. What is the ratio of their areas?",
            "answer": "4:9"
          },
          {
            "difficulty": "Hard",
            "question": "In right triangle ABC (right angle at C), altitude CD is drawn to hypotenuse AB. If AD = 4 and DB = 9, find CD and AC.",
            "answer": "CD = 6, AC = √52 = 2√13"
          }
        ]
      },
      {
        "id": "eg_l3",
        "title": "Geometric Proof",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Name the property: If AB = CD and CD = EF, then AB = EF.",
            "answer": "Transitive Property of Equality"
          },
          {
            "difficulty": "Medium",
            "question": "Given: ∠1 and ∠2 are supplementary; ∠3 and ∠2 are supplementary. Prove: ∠1 = ∠3.",
            "answer": "Both equal 180°−∠2; by transitive/substitution property ∠1=∠3"
          },
          {
            "difficulty": "Hard",
            "question": "Given: l ∥ m, transversal t crosses both. Prove that alternate interior angles are equal using only definitions and the supplementary angle postulate.",
            "answer": "Consecutive interior angles sum to 180° (parallel lines postulate); alternate interior angles are supplementary to the same angle → equal"
          }
        ]
      },
      {
        "id": "eg_l4",
        "title": "Circle Theorems",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "An inscribed angle in a circle intercepts an arc of 96°. Find the inscribed angle.",
            "answer": "48°"
          },
          {
            "difficulty": "Medium",
            "question": "A cyclic quadrilateral has angles A, B, C, D. If ∠A = 75° and ∠C = 110°, what are ∠B and ∠D?",
            "answer": "∠B = 70°, ∠D = 105°"
          },
          {
            "difficulty": "Hard",
            "question": "Two chords AB and CD intersect inside a circle at point P. AP=3, PB=8, CP=4. Find PD.",
            "answer": "PD = 6"
          }
        ]
      },
      {
        "id": "eg_l5",
        "title": "Coordinate Geometry",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the distance between P(0, 0) and Q(6, 8).",
            "answer": "10"
          },
          {
            "difficulty": "Medium",
            "question": "Write the equation of the circle with centre (−2, 3) and radius 5.",
            "answer": "(x+2)² + (y−3)² = 25"
          },
          {
            "difficulty": "Hard",
            "question": "M(4, 1) is the midpoint of segment AB. If A = (1, −3), find B.",
            "answer": "B = (7, 5)"
          }
        ]
      },
      {
        "id": "eg_l6",
        "title": "Transformations",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Translate the point (4, −2) by vector (−3, 5). What is the new point?",
            "answer": "(1, 3)"
          },
          {
            "difficulty": "Medium",
            "question": "Rotate the point (3, 4) by 90° counterclockwise about the origin.",
            "answer": "(−4, 3)"
          },
          {
            "difficulty": "Hard",
            "question": "A triangle with vertices A(1,1), B(3,1), C(2,3) is dilated by a scale factor of 2 about the origin, then reflected over the x-axis. Find the final coordinates.",
            "answer": "A''(2,−2), B''(6,−2), C''(4,−6)"
          }
        ]
      }
    ]
  },
  {
    "id": "intro_trig",
    "title": "Introduction to Trigonometry",
    "level": "Intermediate",
    "color": "#FFB830",
    "icon": "θ",
    "lessons": [
      {
        "id": "trig_l1",
        "title": "SOH-CAH-TOA",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In a right triangle, the side opposite angle θ is 8 and the hypotenuse is 17. Find sin θ, cos θ, and tan θ.",
            "answer": "sin=8/17, cos=15/17, tan=8/15"
          },
          {
            "difficulty": "Medium",
            "question": "If tan θ = 3/4 and θ is acute, find sin θ and cos θ.",
            "answer": "sin θ = 3/5, cos θ = 4/5"
          },
          {
            "difficulty": "Hard",
            "question": "If sin θ = 5/13, verify that sin²θ + cos²θ = 1 and find tan θ.",
            "answer": "cos θ = 12/13, tan θ = 5/12; (5/13)²+(12/13)²=1 ✓"
          }
        ]
      },
      {
        "id": "trig_l2",
        "title": "Solving Right Triangles",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In a right triangle, the hypotenuse is 10 and one angle is 40°. Find the side adjacent to the 40° angle (to 1 decimal place).",
            "answer": "≈ 7.7"
          },
          {
            "difficulty": "Medium",
            "question": "A building casts a shadow of 30 m when the sun is at an angle of elevation of 52°. How tall is the building?",
            "answer": "≈ 38.4 m"
          },
          {
            "difficulty": "Hard",
            "question": "From the top of a 50 m cliff, the angle of depression to a boat is 25°. How far is the boat from the base of the cliff?",
            "answer": "≈ 107.2 m"
          }
        ]
      },
      {
        "id": "trig_l3",
        "title": "Special Angles (30-60-90 & 45-45-90)",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A 45-45-90 triangle has a hypotenuse of 10. Find the lengths of both legs.",
            "answer": "5√2 ≈ 7.07 each"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate without a calculator: tan 45° + 2 sin 30° − cos 60°",
            "answer": "1.5"
          },
          {
            "difficulty": "Hard",
            "question": "A 30-60-90 triangle has the side opposite 60° equal to 9. Find the other two sides.",
            "answer": "Hyp = 6√3, short leg = 3√3"
          }
        ]
      },
      {
        "id": "trig_l4",
        "title": "The Unit Circle",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In which quadrant does an angle of 220° lie? Are sin and cos positive or negative there?",
            "answer": "Quadrant III; both sin and cos are negative"
          },
          {
            "difficulty": "Medium",
            "question": "Find sin 210° and cos 210° exactly.",
            "answer": "sin 210° = −1/2, cos 210° = −√3/2"
          },
          {
            "difficulty": "Hard",
            "question": "If sin θ = −√3/2 and cos θ > 0, find θ (in 0°–360°).",
            "answer": "θ = 300°"
          }
        ]
      },
      {
        "id": "trig_l5",
        "title": "Law of Sines",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In △ABC, A=40°, B=75°, and a=12. Find angle C.",
            "answer": "C = 65°"
          },
          {
            "difficulty": "Medium",
            "question": "In △ABC, A=50°, B=70°, b=20. Find a (to 1 decimal).",
            "answer": "a ≈ 16.3"
          },
          {
            "difficulty": "Hard",
            "question": "Find the area of △ABC where a=10, b=14, and C=38°.",
            "answer": "≈ 43.1 square units"
          }
        ]
      },
      {
        "id": "trig_l6",
        "title": "Law of Cosines",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A triangle has sides a=6, b=8, C=90°. Find c using the Law of Cosines.",
            "answer": "c = 10"
          },
          {
            "difficulty": "Medium",
            "question": "A triangle has sides a=8, b=11, c=13. Find angle C (opposite to c=13) to the nearest degree.",
            "answer": "C ≈ 80°"
          },
          {
            "difficulty": "Hard",
            "question": "Two ships leave port. Ship A travels 35 km on a bearing of N40°E. Ship B travels 50 km on a bearing of S70°E. How far apart are they?",
            "answer": "≈ 56.1 km"
          }
        ]
      }
    ]
  },
  {
    "id": "exponents_logs",
    "title": "Exponents, Radicals & Logarithms",
    "level": "Intermediate",
    "color": "#8B5CF6",
    "icon": "log",
    "lessons": [
      {
        "id": "el_l1",
        "title": "Laws of Exponents (Advanced)",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify: 27^(1/3)",
            "answer": "3"
          },
          {
            "difficulty": "Medium",
            "question": "Simplify: (16x⁴)^(3/4)",
            "answer": "8x³"
          },
          {
            "difficulty": "Hard",
            "question": "Simplify: (x³y⁻²)² / (x⁻¹y³)³",
            "answer": "x⁹/y¹³"
          }
        ]
      },
      {
        "id": "el_l2",
        "title": "Radical Expressions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify: 3√8 + 2√2",
            "answer": "8√2"
          },
          {
            "difficulty": "Medium",
            "question": "Multiply and simplify: (√3 + √5)(√3 − √5)",
            "answer": "−2"
          },
          {
            "difficulty": "Hard",
            "question": "Rationalise the denominator: 4/(√7 − √3)",
            "answer": "√7 + √3"
          }
        ]
      },
      {
        "id": "el_l3",
        "title": "Exponential Functions & Growth",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A bacteria colony starts at 200 and doubles every hour. How many after 5 hours?",
            "answer": "6,400"
          },
          {
            "difficulty": "Medium",
            "question": "$10,000 is invested at 5% compounded quarterly. How much after 8 years?",
            "answer": "≈ $14,861"
          },
          {
            "difficulty": "Hard",
            "question": "A radioactive substance has a half-life of 12 years. What fraction remains after 36 years?",
            "answer": "1/8 (12.5%)"
          }
        ]
      },
      {
        "id": "el_l4",
        "title": "Introduction to Logarithms",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: log₃(81)",
            "answer": "4"
          },
          {
            "difficulty": "Medium",
            "question": "Convert to exponential form: log₅(125) = 3",
            "answer": "5³ = 125"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: log₂(1/32)",
            "answer": "−5"
          }
        ]
      },
      {
        "id": "el_l5",
        "title": "Laws of Logarithms",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Expand: log₄(16x²)",
            "answer": "2 + 2log₄x"
          },
          {
            "difficulty": "Medium",
            "question": "Condense to a single logarithm: 2log x − log(x+1) + log 3",
            "answer": "log(3x²/(x+1))"
          },
          {
            "difficulty": "Hard",
            "question": "Use change of base to evaluate log₇(200) to 2 decimal places.",
            "answer": "≈ 2.71"
          }
        ]
      },
      {
        "id": "el_l6",
        "title": "Solving Exponential & Log Equations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 2^x = 32",
            "answer": "x = 5"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 5^x = 120 (give answer to 2 decimal places)",
            "answer": "x ≈ 2.97"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: log(x+2) + log(x−1) = 1",
            "answer": "x = 3 (reject x = −4)"
          }
        ]
      }
    ]
  },
  {
    "id": "probability",
    "title": "Probability Foundations",
    "level": "Intermediate",
    "color": "#EC4899",
    "icon": "🎲",
    "lessons": [
      {
        "id": "prob_l1",
        "title": "Fundamental Counting Principle",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A coin is flipped and a standard die is rolled. How many different outcomes are there?",
            "answer": "12"
          },
          {
            "difficulty": "Medium",
            "question": "How many 3-digit numbers can be formed from {1, 2, 3, 4, 5} if repetition is allowed?",
            "answer": "125"
          },
          {
            "difficulty": "Hard",
            "question": "A PIN code is 4 digits (0–9), but the first digit cannot be 0 and no digit can repeat. How many valid PINs?",
            "answer": "4,536"
          }
        ]
      },
      {
        "id": "prob_l2",
        "title": "Permutations & Combinations",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "In how many ways can you arrange the letters in the word MATH?",
            "answer": "24"
          },
          {
            "difficulty": "Medium",
            "question": "A team of 3 is chosen from 10 people. How many ways?",
            "answer": "120"
          },
          {
            "difficulty": "Hard",
            "question": "A committee of 4 must include exactly 2 men and 2 women, chosen from 6 men and 7 women. How many committees?",
            "answer": "315"
          }
        ]
      },
      {
        "id": "prob_l3",
        "title": "Conditional Probability",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "P(A) = 0.4, P(B) = 0.3, and A and B are independent. Find P(A ∩ B).",
            "answer": "0.12"
          },
          {
            "difficulty": "Medium",
            "question": "A deck of 52 cards. You draw two cards without replacement. What is P(both are aces)?",
            "answer": "1/221"
          },
          {
            "difficulty": "Hard",
            "question": "60% of students pass a math test; 70% of those who pass also pass science. 30% of those who fail math pass science. What is P(passes science)?",
            "answer": "0.54"
          }
        ]
      },
      {
        "id": "prob_l4",
        "title": "Discrete Probability Distributions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A random variable X has values 1, 2, 3 with probabilities 0.2, 0.5, 0.3. Find E(X).",
            "answer": "E(X) = 2.1"
          },
          {
            "difficulty": "Medium",
            "question": "A lottery ticket costs $2. You win $10 with probability 0.05, otherwise nothing. What is the expected profit per ticket?",
            "answer": "−$1.50"
          },
          {
            "difficulty": "Hard",
            "question": "X has distribution: P(X=0)=0.1, P(X=2)=0.4, P(X=4)=0.4, P(X=6)=0.1. Find E(X) and Var(X).",
            "answer": "E(X)=3, Var(X)=2.8"
          }
        ]
      },
      {
        "id": "prob_l5",
        "title": "Binomial Distribution",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A fair die is rolled 12 times. What is the mean and standard deviation of the number of sixes?",
            "answer": "μ = 2, σ ≈ 1.29"
          },
          {
            "difficulty": "Medium",
            "question": "A test has 5 true/false questions. What is P(exactly 3 correct) if guessing randomly?",
            "answer": "5/16 = 0.3125"
          },
          {
            "difficulty": "Hard",
            "question": "In a batch of 20 items, each has a 10% chance of being defective. Find P(at least 2 defective).",
            "answer": "≈ 0.608"
          }
        ]
      },
      {
        "id": "prob_l6",
        "title": "Normal Distribution & Z-Scores",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Heights are normally distributed with mean 170 cm and std dev 8 cm. What percentage of people are between 162 cm and 178 cm?",
            "answer": "≈ 68%"
          },
          {
            "difficulty": "Medium",
            "question": "A score of 88 comes from a distribution with mean 75 and std dev 10. Find the z-score and interpret it.",
            "answer": "z = 1.3; 1.3 standard deviations above the mean"
          },
          {
            "difficulty": "Hard",
            "question": "IQ scores ~ N(100, 15). Using the 68-95-99.7 rule, what percentage of people have IQ above 130?",
            "answer": "≈ 2.5%"
          }
        ]
      }
    ]
  },
  {
    "id": "polynomials",
    "title": "Polynomial & Rational Functions",
    "level": "Advanced",
    "color": "#6C63FF",
    "icon": "f(x)",
    "lessons": [
      {
        "id": "poly_l1",
        "title": "Polynomial Division & Remainder Theorem",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Use the Remainder Theorem to find the remainder when p(x) = x³ − 4x + 2 is divided by (x − 2).",
            "answer": "2"
          },
          {
            "difficulty": "Medium",
            "question": "Is (x + 3) a factor of p(x) = x³ + 2x² − 5x − 6? Show your reasoning.",
            "answer": "Yes — p(−3) = 0"
          },
          {
            "difficulty": "Hard",
            "question": "Divide 2x³ − 3x² − 8x + 12 by (x − 2) using synthetic division. Then factor the result fully.",
            "answer": "(x−2)(2x²+x−6) = (x−2)(2x−3)(x+2)"
          }
        ]
      },
      {
        "id": "poly_l2",
        "title": "Finding Zeros of Polynomials",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "List all possible rational roots of p(x) = 3x³ − 5x + 2.",
            "answer": "±1, ±2, ±1/3, ±2/3"
          },
          {
            "difficulty": "Medium",
            "question": "Find all zeros of p(x) = x³ − 7x + 6.",
            "answer": "x = 1, x = 2, x = −3"
          },
          {
            "difficulty": "Hard",
            "question": "p(x) = x⁴ − 5x² + 4. Find all real zeros without a calculator.",
            "answer": "x = ±1, ±2"
          }
        ]
      },
      {
        "id": "poly_l3",
        "title": "Graphing Polynomials",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Describe the end behaviour of p(x) = 4x⁵ − 2x² + 1.",
            "answer": "Left: down (−∞); Right: up (+∞)"
          },
          {
            "difficulty": "Medium",
            "question": "p(x) = (x − 2)²(x + 1). State where the graph crosses and touches the x-axis.",
            "answer": "Touches at x=2 (even mult.); crosses at x=−1 (odd mult.)"
          },
          {
            "difficulty": "Hard",
            "question": "Sketch the key features of p(x) = −x³ + 3x² + 4. State: end behaviour, y-intercept, and number of possible turning points.",
            "answer": "End: left↑ right↓; y-int: (0,4); at most 2 turning points"
          }
        ]
      },
      {
        "id": "poly_l4",
        "title": "Asymptotes of Rational Functions",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the vertical and horizontal asymptotes of f(x) = 3/(x − 5).",
            "answer": "VA: x=5; HA: y=0"
          },
          {
            "difficulty": "Medium",
            "question": "Find all asymptotes of f(x) = (x² − 1)/(x² − 4).",
            "answer": "VA: x=2, x=−2; HA: y=1"
          },
          {
            "difficulty": "Hard",
            "question": "Find the oblique asymptote of f(x) = (x² + 3x − 2)/(x − 1).",
            "answer": "y = x + 4"
          }
        ]
      },
      {
        "id": "poly_l5",
        "title": "Graphing Rational Functions",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the x-intercept and y-intercept of f(x) = (2x − 4)/(x + 3).",
            "answer": "x-int: (2,0); y-int: (0, −4/3)"
          },
          {
            "difficulty": "Medium",
            "question": "Find and classify any holes in f(x) = (x²−9)/(x²−x−6).",
            "answer": "Hole at x=3, y=6/5"
          },
          {
            "difficulty": "Hard",
            "question": "For f(x) = (x−1)/(x+2), use a sign chart to determine where f(x) > 0.",
            "answer": "x < −2 or x > 1"
          }
        ]
      },
      {
        "id": "poly_l6",
        "title": "Partial Fractions",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Decompose: 5/((x+1)(x−4))",
            "answer": "−1/(x+1) + 1/(x−4)"
          },
          {
            "difficulty": "Medium",
            "question": "Decompose: (x+7)/((x+1)(x−1))",
            "answer": "3/(x−1) − 2/(x+1)"
          },
          {
            "difficulty": "Hard",
            "question": "Decompose: (3x²+2x+1)/((x−1)(x²+1))",
            "answer": "A=1, B=2, C=1: 1/(x−1) + (2x+1)/(x²+1)"
          }
        ]
      }
    ]
  },
  {
    "id": "precalculus",
    "title": "Pre-Calculus",
    "level": "Advanced",
    "color": "#F97316",
    "icon": "∞",
    "lessons": [
      {
        "id": "pc_l1",
        "title": "Function Transformations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Describe the transformation: y = f(x) + 5",
            "answer": "Vertical shift up 5 units"
          },
          {
            "difficulty": "Medium",
            "question": "Starting from y = x², describe the transformations in y = (x + 3)² − 4.",
            "answer": "Shift left 3, shift down 4"
          },
          {
            "difficulty": "Hard",
            "question": "Write the equation of y = |x| after: reflect over x-axis, stretch vertically by 3, shift right 2, shift up 1.",
            "answer": "y = −3|x − 2| + 1"
          }
        ]
      },
      {
        "id": "pc_l2",
        "title": "Inverse Functions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the inverse of f(x) = 4x − 7.",
            "answer": "f⁻¹(x) = (x + 7)/4"
          },
          {
            "difficulty": "Medium",
            "question": "Find the inverse of f(x) = √(x − 2) and state its domain.",
            "answer": "f⁻¹(x) = x² + 2, domain: x ≥ 0"
          },
          {
            "difficulty": "Hard",
            "question": "Show that f(x) = 2x + 1 and g(x) = (x−1)/2 are inverses by computing f(g(x)) and g(f(x)).",
            "answer": "Both equal x, confirming they are inverses"
          }
        ]
      },
      {
        "id": "pc_l3",
        "title": "Conic Sections",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Identify: x² + y² = 49. State its centre and radius.",
            "answer": "Circle; centre (0,0); radius 7"
          },
          {
            "difficulty": "Medium",
            "question": "Write the standard form of an ellipse centred at (2, −1) with a=5 (along x-axis) and b=3.",
            "answer": "(x−2)²/25 + (y+1)²/9 = 1"
          },
          {
            "difficulty": "Hard",
            "question": "Identify the conic: x² − 4y² − 6x + 8y − 11 = 0. Find its centre by completing the square.",
            "answer": "Hyperbola; centre (3, 1)"
          }
        ]
      },
      {
        "id": "pc_l4",
        "title": "Introduction to Limits",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: lim(x→3) (2x² − 5)",
            "answer": "13"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: lim(x→5) (x²−25)/(x−5)",
            "answer": "10"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: lim(x→0) (√(x+9) − 3)/x",
            "answer": "1/6"
          }
        ]
      },
      {
        "id": "pc_l5",
        "title": "Continuity & End Behaviour",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Is f(x) = 3x² − x + 4 continuous at x = 2? Explain.",
            "answer": "Yes — polynomials are continuous everywhere."
          },
          {
            "difficulty": "Medium",
            "question": "Classify the discontinuity of f(x) = (x²−4)/(x−2) at x=2.",
            "answer": "Removable discontinuity (hole at x=2)"
          },
          {
            "difficulty": "Hard",
            "question": "f(x) = x²−1 for x<2, and f(x) = 3x−3 for x≥2. Is f continuous at x=2?",
            "answer": "Yes — left limit = right limit = f(2) = 3"
          }
        ]
      },
      {
        "id": "pc_l6",
        "title": "Introduction to the Derivative",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the average rate of change of f(x) = x² between x=1 and x=4.",
            "answer": "5"
          },
          {
            "difficulty": "Medium",
            "question": "Use the limit definition to find f'(x) for f(x) = 3x + 5.",
            "answer": "f'(x) = 3"
          },
          {
            "difficulty": "Hard",
            "question": "Use the limit definition to find f'(x) for f(x) = x² + 2x.",
            "answer": "f'(x) = 2x + 2"
          }
        ]
      }
    ]
  },
  {
    "id": "adv_trig",
    "title": "Advanced Trigonometry",
    "level": "Advanced",
    "color": "#FFB830",
    "icon": "sin",
    "lessons": [
      {
        "id": "atrig_l1",
        "title": "Fundamental Trig Identities",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify: sin²θ + cos²θ + tan²θ",
            "answer": "sec²θ"
          },
          {
            "difficulty": "Medium",
            "question": "Simplify: (1 − sin²θ)/cosθ",
            "answer": "cosθ"
          },
          {
            "difficulty": "Hard",
            "question": "Prove: tanθ + cotθ = secθ · cscθ",
            "answer": "LHS = sinθ/cosθ + cosθ/sinθ = (sin²θ+cos²θ)/(sinθcosθ) = 1/(sinθcosθ) = secθ·cscθ = RHS"
          }
        ]
      },
      {
        "id": "atrig_l2",
        "title": "Sum, Difference & Double Angle Formulas",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the exact value of sin 105°.",
            "answer": "(√6 + √2)/4"
          },
          {
            "difficulty": "Medium",
            "question": "If sin A = 3/5 (A in Q1), find sin 2A and cos 2A.",
            "answer": "sin 2A = 24/25; cos 2A = 7/25"
          },
          {
            "difficulty": "Hard",
            "question": "Prove: cos 2θ / (1 − sin 2θ) = (1 + tan θ)/(1 − tan θ)",
            "answer": "Use double angle and quotient identities to simplify both sides to the same expression"
          }
        ]
      },
      {
        "id": "atrig_l3",
        "title": "Solving Trig Equations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Solve: 2cos x = 1 for x ∈ [0°, 360°).",
            "answer": "x = 60°, 300°"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: 2sin²x − 1 = 0 for x ∈ [0°, 360°).",
            "answer": "45°, 135°, 225°, 315°"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: tan²x + tanx − 2 = 0 for x ∈ [0°, 360°).",
            "answer": "45°, 116.6°, 225°, 296.6°"
          }
        ]
      },
      {
        "id": "atrig_l4",
        "title": "Graphs of Sin, Cos & Tan",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "State the amplitude and period of y = 5cos(4x).",
            "answer": "Amplitude = 5; Period = π/2"
          },
          {
            "difficulty": "Medium",
            "question": "A sinusoidal function has amplitude 3, period 4π, and a phase shift of π/2 to the right. Write its equation.",
            "answer": "y = 3sin((1/2)x − π/4)"
          },
          {
            "difficulty": "Hard",
            "question": "Identify all key parameters of y = −2sin(3x + π) + 1 and describe the graph.",
            "answer": "Amp=2 (reflected), Period=2π/3, Phase=π/3 left, Vertical shift=1 up"
          }
        ]
      },
      {
        "id": "atrig_l5",
        "title": "Inverse Trig Functions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: arcsin(1/2) in degrees.",
            "answer": "30°"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: sin(arccos(5/13)).",
            "answer": "12/13"
          },
          {
            "difficulty": "Hard",
            "question": "Simplify: tan(arcsin(x)).",
            "answer": "x/√(1−x²)"
          }
        ]
      },
      {
        "id": "atrig_l6",
        "title": "Polar Coordinates",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Convert the polar point (6, π/6) to Cartesian coordinates.",
            "answer": "(3√3, 3)"
          },
          {
            "difficulty": "Medium",
            "question": "Convert the Cartesian point (−3, 3) to polar form.",
            "answer": "r = 3√2, θ = 3π/4 (135°)"
          },
          {
            "difficulty": "Hard",
            "question": "Convert the polar equation r = 4sinθ to Cartesian form and identify the curve.",
            "answer": "x² + (y−2)² = 4; circle centred at (0,2) with radius 2"
          }
        ]
      }
    ]
  },
  {
    "id": "sequences_series",
    "title": "Sequences & Series",
    "level": "Advanced",
    "color": "#EC4899",
    "icon": "Σ",
    "lessons": [
      {
        "id": "seq_l1",
        "title": "Arithmetic & Geometric Sequences",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the 15th term of the arithmetic sequence: 3, 7, 11, 15, …",
            "answer": "59"
          },
          {
            "difficulty": "Medium",
            "question": "A geometric sequence has a₁=5 and r=3. Write the recursive formula and find a₅.",
            "answer": "aₙ=3·aₙ₋₁; a₅=405"
          },
          {
            "difficulty": "Hard",
            "question": "The 3rd term of a geometric sequence is 20 and the 6th term is 160. Find a₁ and r.",
            "answer": "r=2, a₁=5"
          }
        ]
      },
      {
        "id": "seq_l2",
        "title": "Series & Sigma Notation",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find: 1 + 2 + 3 + … + 50",
            "answer": "1,275"
          },
          {
            "difficulty": "Medium",
            "question": "Find the sum of the geometric series: 2 + 6 + 18 + 54 + … (first 8 terms)",
            "answer": "6,560"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: Σᵢ₌₁¹⁰ (3i − 1)",
            "answer": "155"
          }
        ]
      },
      {
        "id": "seq_l3",
        "title": "Infinite Geometric Series",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the sum of the infinite geometric series: 8 + 4 + 2 + 1 + …",
            "answer": "16"
          },
          {
            "difficulty": "Medium",
            "question": "Write 0.272727… as a fraction using the infinite geometric series formula.",
            "answer": "3/11"
          },
          {
            "difficulty": "Hard",
            "question": "For what values of x does Σₙ₌₀^∞ (x−2)ⁿ converge? Find the sum when x=1.5.",
            "answer": "Converges when |x−2|<1, i.e. 1<x<3; sum at x=1.5 is 2"
          }
        ]
      },
      {
        "id": "seq_l4",
        "title": "Binomial Theorem",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Expand (x + 2)³ using the Binomial Theorem.",
            "answer": "x³ + 6x² + 12x + 8"
          },
          {
            "difficulty": "Medium",
            "question": "Find the 4th term in the expansion of (3x − 2)⁶.",
            "answer": "−4320x³"
          },
          {
            "difficulty": "Hard",
            "question": "Find the term independent of x in the expansion of (x + 1/x)⁸.",
            "answer": "70"
          }
        ]
      },
      {
        "id": "seq_l5",
        "title": "Mathematical Induction",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Verify the base case (n=1) for the formula 1+2+…+n = n(n+1)/2.",
            "answer": "LHS=1; RHS=1(2)/2=1 ✓"
          },
          {
            "difficulty": "Medium",
            "question": "In the inductive step for 1+3+5+…+(2n−1) = n², write the inductive hypothesis and what you need to show for n=k+1.",
            "answer": "Hypothesis: 1+3+…+(2k−1)=k². Need to show: 1+3+…+(2k+1)=(k+1)²"
          },
          {
            "difficulty": "Hard",
            "question": "Prove by induction: 2ⁿ > n for all n ≥ 1. Show the inductive step clearly.",
            "answer": "Base: 2¹=2>1 ✓. Inductive step: assume 2ᵏ>k; show 2^(k+1)>k+1."
          }
        ]
      },
      {
        "id": "seq_l6",
        "title": "Recursive Sequences & Fibonacci",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "List the first 10 Fibonacci numbers.",
            "answer": "1, 1, 2, 3, 5, 8, 13, 21, 34, 55"
          },
          {
            "difficulty": "Medium",
            "question": "A sequence is defined by a₁=3, a₂=7, aₙ=aₙ₋₁+2aₙ₋₂. Find a₅.",
            "answer": "45"
          },
          {
            "difficulty": "Hard",
            "question": "The ratio of consecutive Fibonacci terms F₁₀/F₉ = 55/34. How close is this to φ ≈ 1.6180? What is the percentage error?",
            "answer": "≈ 1.6176; error ≈ 0.025%"
          }
        ]
      }
    ]
  },
  {
    "id": "combinatorics",
    "title": "Combinatorics & Discrete Math",
    "level": "Advanced",
    "color": "#06B6D4",
    "icon": "C(n,k)",
    "lessons": [
      {
        "id": "comb_l1",
        "title": "Inclusion-Exclusion Principle",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Out of 50 students: 30 study French, 20 study Spanish, 8 study both. How many study at least one language?",
            "answer": "42"
          },
          {
            "difficulty": "Medium",
            "question": "How many students study neither language in the above problem (50 students total)?",
            "answer": "8"
          },
          {
            "difficulty": "Hard",
            "question": "In a class of 100: 60 play chess, 50 play checkers, 40 play backgammon. 25 play chess+checkers, 20 play chess+backgammon, 15 play checkers+backgammon, 10 play all three. How many play at least one?",
            "answer": "100"
          }
        ]
      },
      {
        "id": "comb_l2",
        "title": "Pigeonhole Principle",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "There are 10 pigeonholes and 11 pigeons. What does the pigeonhole principle guarantee?",
            "answer": "At least one pigeonhole contains at least 2 pigeons"
          },
          {
            "difficulty": "Medium",
            "question": "You have 25 socks in a drawer: 10 red, 10 blue, 5 green. How many must you draw (without looking) to guarantee a matching pair?",
            "answer": "4"
          },
          {
            "difficulty": "Hard",
            "question": "Among any 5 integers, prove that at least two must have the same remainder when divided by 4.",
            "answer": "Remainders are 0,1,2,3 (4 possibilities). With 5 integers, PHP guarantees two share a remainder."
          }
        ]
      },
      {
        "id": "comb_l3",
        "title": "Generating Functions (Introduction)",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the generating function for the sequence 1, 2, 3, 4, … (aₙ = n+1).",
            "answer": "1/(1−x)²"
          },
          {
            "difficulty": "Medium",
            "question": "The coefficient of x³ in 1/(1−x) is 1. The coefficient of x³ in 1/(1−x)² is 4. Verify the second claim.",
            "answer": "C(3+1,1) = C(4,1) = 4 ✓"
          },
          {
            "difficulty": "Hard",
            "question": "How many ways can you make change for 10 cents using pennies (1¢) and nickels (5¢)? Set up the generating function and find the answer.",
            "answer": "3 ways: (10P), (5P+1N), (2N)"
          }
        ]
      },
      {
        "id": "comb_l4",
        "title": "Introduction to Graph Theory",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A graph has 5 vertices each with degree 4. How many edges does it have?",
            "answer": "10 edges"
          },
          {
            "difficulty": "Medium",
            "question": "How many edges does the complete graph K₇ have?",
            "answer": "21"
          },
          {
            "difficulty": "Hard",
            "question": "A connected graph has 8 vertices and 7 edges with no cycles. What type of graph is this, and what can you conclude about its structure?",
            "answer": "It is a tree — exactly one path between any two vertices"
          }
        ]
      },
      {
        "id": "comb_l5",
        "title": "Propositional Logic",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "p = \"It is sunny\", q = \"I wear sunglasses.\" Write p → q and its contrapositive.",
            "answer": "p→q: \"If sunny then I wear sunglasses.\" Contrapositive: \"If I do not wear sunglasses, then it is not sunny.\""
          },
          {
            "difficulty": "Medium",
            "question": "When is the statement p → q FALSE?",
            "answer": "Only when p is TRUE and q is FALSE"
          },
          {
            "difficulty": "Hard",
            "question": "Show that p → q and its contrapositive ¬q → ¬p have identical truth tables.",
            "answer": "Row by row, both are false only when p=T and q=F"
          }
        ]
      },
      {
        "id": "comb_l6",
        "title": "Set Theory & Functions",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A={1,2,3}, B={2,3,4,5}. Find A∩B and A∪B.",
            "answer": "A∩B={2,3}; A∪B={1,2,3,4,5}"
          },
          {
            "difficulty": "Medium",
            "question": "List all subsets of {a, b, c}. How many are there?",
            "answer": "8 subsets: ∅, {a}, {b}, {c}, {a,b}, {a,c}, {b,c}, {a,b,c}"
          },
          {
            "difficulty": "Hard",
            "question": "Apply De Morgan's Law to simplify (A∪B)ᶜ when A={1,2,3} and B={3,4,5}, with universal set U={1,2,3,4,5,6}.",
            "answer": "{6} = Aᶜ∩Bᶜ"
          }
        ]
      }
    ]
  },
  {
    "id": "inferential_stats",
    "title": "Inferential Statistics",
    "level": "Advanced",
    "color": "#43D9AD",
    "icon": "x̄",
    "lessons": [
      {
        "id": "inf_l1",
        "title": "Sampling Distributions",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Population μ=100, σ=20, sample n=25. What is the standard error of the mean?",
            "answer": "SE = 4"
          },
          {
            "difficulty": "Medium",
            "question": "Population μ=50, σ=10, n=100. Find P(x̄ < 48).",
            "answer": "≈ 0.0228"
          },
          {
            "difficulty": "Hard",
            "question": "You want the standard error to be at most 1.5 for a population with σ=12. What is the minimum sample size?",
            "answer": "n ≥ 64"
          }
        ]
      },
      {
        "id": "inf_l2",
        "title": "Confidence Intervals",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "x̄=50, σ=10, n=100. Compute the 95% CI for μ.",
            "answer": "(48.04, 51.96)"
          },
          {
            "difficulty": "Medium",
            "question": "You want a 95% CI with margin of error ≤ 2. If σ=10, what sample size do you need?",
            "answer": "n ≥ 97"
          },
          {
            "difficulty": "Hard",
            "question": "A 90% CI for μ is (44, 56). What would happen to the interval if you used 99% confidence with the same data?",
            "answer": "It would be wider — higher confidence requires a larger margin of error"
          }
        ]
      },
      {
        "id": "inf_l3",
        "title": "Hypothesis Testing",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "State H₀ and H₁ for: \"We believe the mean weight of packages is more than 500g.\"",
            "answer": "H₀: μ ≤ 500; H₁: μ > 500 (right-tailed test)"
          },
          {
            "difficulty": "Medium",
            "question": "A test gives z = 2.10 for a two-tailed test at α = 0.05. The critical values are ±1.96. What is your conclusion?",
            "answer": "Reject H₀ (2.10 > 1.96)"
          },
          {
            "difficulty": "Hard",
            "question": "p-value = 0.03. The significance level is α = 0.05. (a) What is the decision? (b) What type of error could you be making?",
            "answer": "(a) Reject H₀. (b) Type I error (rejecting a true H₀) with probability 0.05"
          }
        ]
      },
      {
        "id": "inf_l4",
        "title": "Linear Regression Analysis",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "The regression line is ŷ = 4x + 7. Predict y when x = 5.",
            "answer": "ŷ = 27"
          },
          {
            "difficulty": "Medium",
            "question": "r = 0.9, x̄ = 5, ȳ = 20, sₓ = 2, sᵧ = 8. Find the regression equation.",
            "answer": "ŷ = 3.6x + 2"
          },
          {
            "difficulty": "Hard",
            "question": "R²=0.81 in a linear regression. Interpret this value and state what r equals.",
            "answer": "R²=0.81 means 81% of variance in y is explained by x; r=0.9 (assuming positive relationship)"
          }
        ]
      },
      {
        "id": "inf_l5",
        "title": "Chi-Square Tests",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "For a goodness-of-fit test with 4 categories, what is the degrees of freedom?",
            "answer": "df = 3"
          },
          {
            "difficulty": "Medium",
            "question": "Observed: [15, 25, 20]. Expected: [20, 20, 20]. Calculate χ².",
            "answer": "χ² = 2.5"
          },
          {
            "difficulty": "Hard",
            "question": "A 2×3 contingency table tests independence. What are the degrees of freedom, and what does a large χ² indicate?",
            "answer": "df = (2−1)(3−1) = 2; large χ² → evidence of association between the two variables"
          }
        ]
      },
      {
        "id": "inf_l6",
        "title": "ANOVA & Multiple Comparisons",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Why can't we just run multiple t-tests instead of ANOVA when comparing 3 groups?",
            "answer": "Multiple t-tests inflate the Type I error rate above α"
          },
          {
            "difficulty": "Medium",
            "question": "ANOVA gives F = 5.80, F_critical = 3.40 at α = 0.05. State the conclusion.",
            "answer": "Reject H₀ — at least one group mean differs significantly"
          },
          {
            "difficulty": "Hard",
            "question": "ANOVA rejects H₀ for 4 groups. You want to know WHICH pairs differ. Name the appropriate follow-up procedure and why it is needed.",
            "answer": "Post-hoc test (e.g. Tukey HSD or Bonferroni) — controls for multiple comparison error inflation"
          }
        ]
      }
    ]
  },
  {
    "id": "vectors_matrices",
    "title": "Vectors & Matrices",
    "level": "Advanced",
    "color": "#8B5CF6",
    "icon": "[ ]",
    "lessons": [
      {
        "id": "vm_l1",
        "title": "Vector Operations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the magnitude of v = ⟨5, 12⟩.",
            "answer": "13"
          },
          {
            "difficulty": "Medium",
            "question": "Find the angle between v = ⟨1, 0⟩ and w = ⟨1, 1⟩.",
            "answer": "45°"
          },
          {
            "difficulty": "Hard",
            "question": "u = ⟨3, 4⟩. Find the unit vector û and verify |û| = 1.",
            "answer": "û = ⟨3/5, 4/5⟩; |û| = 1"
          }
        ]
      },
      {
        "id": "vm_l2",
        "title": "Cross Product & 3D Vectors",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "v = ⟨1,0,0⟩ and w = ⟨0,1,0⟩. Find v × w.",
            "answer": "⟨0, 0, 1⟩"
          },
          {
            "difficulty": "Medium",
            "question": "Find v × w for v=⟨2,3,0⟩ and w=⟨1,0,4⟩.",
            "answer": "⟨12, −8, −3⟩"
          },
          {
            "difficulty": "Hard",
            "question": "Find the area of the parallelogram formed by a=⟨3,1,0⟩ and b=⟨−1,2,0⟩.",
            "answer": "7"
          }
        ]
      },
      {
        "id": "vm_l3",
        "title": "Vector Applications",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Force F=⟨4,0⟩ N moves an object along d=⟨5,0⟩ m. Calculate the work done.",
            "answer": "20 J"
          },
          {
            "difficulty": "Medium",
            "question": "Find the scalar projection of v=⟨6,2⟩ onto w=⟨3,4⟩.",
            "answer": "26/5 = 5.2"
          },
          {
            "difficulty": "Hard",
            "question": "Find the vector projection of v=⟨4,3⟩ onto w=⟨2,0⟩.",
            "answer": "⟨4, 0⟩"
          }
        ]
      },
      {
        "id": "vm_l4",
        "title": "Matrix Operations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Add: [[1,2],[3,4]] + [[5,6],[7,8]]",
            "answer": "[[6,8],[10,12]]"
          },
          {
            "difficulty": "Medium",
            "question": "Multiply: [[2,1],[0,3]] × [[1,4],[2,0]]",
            "answer": "[[4,8],[6,0]]"
          },
          {
            "difficulty": "Hard",
            "question": "A is 2×3 and B is 3×4. What is the size of AB? What is the size of BA?",
            "answer": "AB is 2×4; BA is undefined (4×2 cannot multiply 2×3)"
          }
        ]
      },
      {
        "id": "vm_l5",
        "title": "Determinants & Inverses",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the determinant of [[4,2],[1,3]].",
            "answer": "10"
          },
          {
            "difficulty": "Medium",
            "question": "Find the inverse of A = [[2,3],[1,2]].",
            "answer": "A⁻¹ = [[2,−3],[−1,2]]"
          },
          {
            "difficulty": "Hard",
            "question": "Is [[2,4],[1,2]] invertible? Explain. What does this mean geometrically?",
            "answer": "No — det=0; the rows are linearly dependent; geometrically the matrix collapses the plane to a line"
          }
        ]
      },
      {
        "id": "vm_l6",
        "title": "Solving Systems with Matrices",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the augmented matrix for: 3x + y = 7 and x − 2y = 1.",
            "answer": "[[3, 1 | 7], [1, −2 | 1]]"
          },
          {
            "difficulty": "Medium",
            "question": "Solve the system using the matrix inverse method: x + 2y = 8 and 3x + y = 9.",
            "answer": "x = 2, y = 3"
          },
          {
            "difficulty": "Hard",
            "question": "Use Gaussian elimination to solve: 2x+y+z=5, x+3y+z=10, x+y+2z=7.",
            "answer": "x=1, y=2, z=2"
          }
        ]
      }
    ]
  },
  {
    "id": "complex_numbers",
    "title": "Complex Numbers",
    "level": "Advanced",
    "color": "#EC4899",
    "icon": "ℂ",
    "lessons": [
      {
        "id": "cx_l1",
        "title": "The Complex Number System",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify: (2 + 3i) + (5 − i)",
            "answer": "7 + 2i"
          },
          {
            "difficulty": "Medium",
            "question": "Divide: (3 + 4i)/(1 − 2i)",
            "answer": "−1 + 2i"
          },
          {
            "difficulty": "Hard",
            "question": "Find i⁵⁷ without a calculator.",
            "answer": "i"
          }
        ]
      },
      {
        "id": "cx_l2",
        "title": "Polar Form & Argand Plane",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the modulus of z = 3 − 4i.",
            "answer": "|z| = 5"
          },
          {
            "difficulty": "Medium",
            "question": "Write z = √3 + i in polar form r(cosθ + i sinθ).",
            "answer": "z = 2(cos 30° + i sin 30°)"
          },
          {
            "difficulty": "Hard",
            "question": "Multiply z₁ = 3e^(iπ/4) and z₂ = 2e^(iπ/3) using polar form. Give result in polar and rectangular form.",
            "answer": "6e^(i7π/12); rectangular ≈ 1.55 + 5.80i"
          }
        ]
      },
      {
        "id": "cx_l3",
        "title": "De Moivre's Theorem & Roots of Unity",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Use De Moivre's theorem to find (cos 20° + i sin 20°)³.",
            "answer": "cos 60° + i sin 60° = 1/2 + i√3/2"
          },
          {
            "difficulty": "Medium",
            "question": "Find all 4th roots of unity (the 4 solutions to z⁴ = 1).",
            "answer": "1, i, −1, −i"
          },
          {
            "difficulty": "Hard",
            "question": "Compute (1+i)⁸ using De Moivre's theorem.",
            "answer": "16"
          }
        ]
      },
      {
        "id": "cx_l4",
        "title": "Fundamental Theorem of Algebra",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A degree-4 polynomial with real coefficients has roots 1 and 2+3i. List all four roots.",
            "answer": "1, 1 (or another real), 2+3i, 2−3i"
          },
          {
            "difficulty": "Medium",
            "question": "Find a polynomial with real coefficients of minimal degree having 3 and 1−2i as roots.",
            "answer": "(x−3)(x²−2x+5)"
          },
          {
            "difficulty": "Hard",
            "question": "p(x) = x⁴ − 3x³ + 6x² − 12x + 8. Given that x = 2i is a root, find all roots.",
            "answer": "2i, −2i, 1 (mult. 2)"
          }
        ]
      },
      {
        "id": "cx_l5",
        "title": "Complex Numbers in AC Circuits",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A circuit has R=6Ω and X_L=8Ω in series. Find the impedance magnitude |Z| and phase angle.",
            "answer": "|Z|=10Ω, φ=53.1°"
          },
          {
            "difficulty": "Medium",
            "question": "Two impedances in series: Z₁=3+4j and Z₂=1−2j. Find the total impedance.",
            "answer": "Z_total = 4 + 2j; |Z_total| = √20 = 2√5 ≈ 4.47Ω"
          },
          {
            "difficulty": "Hard",
            "question": "V = 10e^(j0) and I = 2e^(−jπ/6). Find the complex power S = V·I* and state the real power.",
            "answer": "S = 20e^(jπ/6) ≈ 17.32 + 10j W; real power ≈ 17.32 W"
          }
        ]
      },
      {
        "id": "cx_l6",
        "title": "Fractals & the Mandelbrot Set",
        "duration": "10 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Test c = 0. Compute the first 4 iterates of z_{n+1} = z_n² + 0, starting z₀ = 0. Is c = 0 in the Mandelbrot set?",
            "answer": "All iterates = 0; c = 0 is in the set."
          },
          {
            "difficulty": "Medium",
            "question": "Perform 5 iterations of z_{n+1} = z_n² + c for c = −2. Does it escape?",
            "answer": "No — bounded at −2 (in the set)"
          },
          {
            "difficulty": "Hard",
            "question": "Show that if |z_n| > 2 for some n, the iteration z_{n+1} = z_n² + c must diverge to infinity. (Hint: show |z_{n+1}| > |z_n| for |z_n| > 2 and |c| ≤ 2.)",
            "answer": "Once |z_n| > 2, subsequent terms grow without bound."
          }
        ]
      }
    ]
  },
  {
    "id": "diff_calculus",
    "title": "Differential Calculus",
    "level": "Expert",
    "color": "#6C63FF",
    "icon": "f'",
    "lessons": [
      {
        "id": "dc_l1",
        "title": "Differentiation Rules",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Differentiate f(x) = 4x⁵ − 3x² + 7.",
            "answer": "f'(x) = 20x⁴ − 6x"
          },
          {
            "difficulty": "Medium",
            "question": "Differentiate g(x) = x² sin x using the product rule.",
            "answer": "g'(x) = 2x sin x + x² cos x"
          },
          {
            "difficulty": "Hard",
            "question": "Differentiate h(x) = sin(x²) / (x³ + 1) using chain and quotient rules.",
            "answer": "h'(x) = [2x cos(x²)(x³+1) − 3x² sin(x²)] / (x³+1)²"
          }
        ]
      },
      {
        "id": "dc_l2",
        "title": "Derivatives of Trig, Exp & Log",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Differentiate f(x) = e^(5x).",
            "answer": "f'(x) = 5e^(5x)"
          },
          {
            "difficulty": "Medium",
            "question": "Differentiate y = ln(sin x).",
            "answer": "y' = cos x / sin x = cot x"
          },
          {
            "difficulty": "Hard",
            "question": "Differentiate f(x) = x² · 3^x · ln x.",
            "answer": "f'(x) = 3^x(2x ln x + x² ln 3 · ln x + x)"
          }
        ]
      },
      {
        "id": "dc_l3",
        "title": "Implicit Differentiation & Related Rates",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find dy/dx for x² + y² = 25 using implicit differentiation.",
            "answer": "dy/dx = −x/y"
          },
          {
            "difficulty": "Medium",
            "question": "Find dy/dx for x³ + y³ = 6xy using implicit differentiation.",
            "answer": "dy/dx = (2y − x²) / (y² − 2x)"
          },
          {
            "difficulty": "Hard",
            "question": "A spherical balloon is being inflated at 50 cm³/s. How fast is its radius increasing when r = 5 cm?",
            "answer": "dr/dt = 1/(2π) cm/s ≈ 0.159 cm/s"
          }
        ]
      },
      {
        "id": "dc_l4",
        "title": "Curve Sketching",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the critical points of f(x) = x³ − 6x.",
            "answer": "x = √2 and x = −√2"
          },
          {
            "difficulty": "Medium",
            "question": "Classify the critical points of f(x) = x⁴ − 8x² using the second derivative test.",
            "answer": "Local maxima at x = 0 (f=0); local minima at x = ±2 (f=−16)"
          },
          {
            "difficulty": "Hard",
            "question": "Sketch the key features of f(x) = x/(x²+1): find critical points, inflection points, and limits as x→±∞.",
            "answer": "Local max at x=1 (f=1/2); local min at x=−1 (f=−1/2); inflections at x=0,±√3; horizontal asymptote y=0"
          }
        ]
      },
      {
        "id": "dc_l5",
        "title": "Optimisation",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find two non-negative numbers that add to 20 and whose product is maximised.",
            "answer": "Both numbers are 10; maximum product is 100."
          },
          {
            "difficulty": "Medium",
            "question": "A box with a square base and no lid must have a volume of 32 cm³. Find the dimensions that minimise surface area.",
            "answer": "Base side 4 cm, height 2 cm"
          },
          {
            "difficulty": "Hard",
            "question": "Find the dimensions of the rectangle of largest area that can be inscribed in a semicircle of radius r.",
            "answer": "Width = r√2, height = r/√2; area = r²"
          }
        ]
      },
      {
        "id": "dc_l6",
        "title": "L'Hôpital's Rule & Limits at Infinity",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: lim(x→0) (tan x)/x using L'Hôpital's rule.",
            "answer": "1"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: lim(x→∞) x·e^(−x).",
            "answer": "0"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: lim(x→0⁺) x^x.",
            "answer": "1"
          }
        ]
      }
    ]
  },
  {
    "id": "integral_calculus",
    "title": "Integral Calculus",
    "level": "Expert",
    "color": "#F97316",
    "icon": "∫",
    "lessons": [
      {
        "id": "ic_l1",
        "title": "Antiderivatives & Indefinite Integrals",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: ∫(5x⁴ + 2x) dx.",
            "answer": "x⁵ + x² + C"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: ∫(eˣ + 1/x + cos x) dx.",
            "answer": "eˣ + ln|x| + sin x + C"
          },
          {
            "difficulty": "Hard",
            "question": "Given f'(x) = 3x² − 2x and f(1) = 4, find f(x).",
            "answer": "f(x) = x³ − x² + 4"
          }
        ]
      },
      {
        "id": "ic_l2",
        "title": "The Fundamental Theorem of Calculus",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: ∫₁⁴ (2x + 1) dx.",
            "answer": "18"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: ∫₀^π sin x dx.",
            "answer": "2"
          },
          {
            "difficulty": "Hard",
            "question": "Use FTC Part 1 to find d/dx[∫₀^(x²) sin(t³) dt].",
            "answer": "2x sin(x⁶)"
          }
        ]
      },
      {
        "id": "ic_l3",
        "title": "Integration by Substitution",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: ∫ 3x² (x³ + 1)⁵ dx.",
            "answer": "(x³+1)⁶/6 + C"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: ∫₀¹ x·e^(x²) dx.",
            "answer": "(e−1)/2"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: ∫ sin(ln x)/x dx.",
            "answer": "−cos(ln x) + C"
          }
        ]
      },
      {
        "id": "ic_l4",
        "title": "Integration by Parts",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate: ∫ x cos x dx using integration by parts.",
            "answer": "x sin x + cos x + C"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate: ∫ ln x dx.",
            "answer": "x ln x − x + C"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate: ∫ eˣ sin x dx.",
            "answer": "eˣ(sin x − cos x)/2 + C"
          }
        ]
      },
      {
        "id": "ic_l5",
        "title": "Area Between Curves & Volume",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the area between y = x and y = x² from x = 0 to x = 1.",
            "answer": "1/6"
          },
          {
            "difficulty": "Medium",
            "question": "Find the volume when y = √x is rotated about the x-axis from x = 0 to x = 4 (disk method).",
            "answer": "8π"
          },
          {
            "difficulty": "Hard",
            "question": "Find the volume of the solid obtained by rotating the region between y = x² and y = x (for x ∈ [0,1]) about the x-axis using the washer method.",
            "answer": "2π/15"
          }
        ]
      },
      {
        "id": "ic_l6",
        "title": "Improper Integrals",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Does ∫₁^∞ 1/x³ dx converge or diverge? If it converges, find its value.",
            "answer": "Converges to 1/2"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate ∫₀^∞ e^(−3x) dx.",
            "answer": "1/3"
          },
          {
            "difficulty": "Hard",
            "question": "Show that ∫₀¹ (1/√x) dx converges and find its value. (The integrand has a vertical asymptote at x=0.)",
            "answer": "Converges to 2"
          }
        ]
      }
    ]
  },
  {
    "id": "multivariable_calc",
    "title": "Multivariable Calculus",
    "level": "Expert",
    "color": "#43D9AD",
    "icon": "∂",
    "lessons": [
      {
        "id": "mvc_l1",
        "title": "Functions of Several Variables",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find ∂f/∂x and ∂f/∂y for f(x,y) = x²y + 3y².",
            "answer": "∂f/∂x = 2xy; ∂f/∂y = x² + 6y"
          },
          {
            "difficulty": "Medium",
            "question": "Find all second partial derivatives of f(x,y) = x³y − eˣʸ and verify Clairaut's theorem.",
            "answer": "fₓₓ = 6xy − y²eˣʸ; fᵧᵧ = −x²eˣʸ; fₓᵧ = fᵧₓ = 3x² − xeˣʸ − xyeˣʸ"
          },
          {
            "difficulty": "Hard",
            "question": "Find all critical points of f(x,y) = x³ + y³ − 3xy.",
            "answer": "Critical points at (0,0) and (1,1)"
          }
        ]
      },
      {
        "id": "mvc_l2",
        "title": "Gradient, Directional Derivatives & Optimisation",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the gradient of f(x,y) = 3x² + 2y³.",
            "answer": "∇f = ⟨6x, 6y²⟩"
          },
          {
            "difficulty": "Medium",
            "question": "Find the directional derivative of f(x,y)=x²+xy at (1,2) in the direction of v=⟨3,4⟩.",
            "answer": "D_û f = 22/5 = 4.4"
          },
          {
            "difficulty": "Hard",
            "question": "Classify the critical point (1,1) of f(x,y) = x³ + y³ − 3xy using the Hessian test.",
            "answer": "Local minimum"
          }
        ]
      },
      {
        "id": "mvc_l3",
        "title": "Double & Triple Integrals",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Evaluate ∫₀² ∫₀³ xy dy dx.",
            "answer": "9"
          },
          {
            "difficulty": "Medium",
            "question": "Evaluate ∫∫_R (x² + y²) dA over the region R = [0,1] × [0,1].",
            "answer": "2/3"
          },
          {
            "difficulty": "Hard",
            "question": "Evaluate ∬_D √(x²+y²) dA where D is the disk x²+y²≤9, using polar coordinates.",
            "answer": "18π"
          }
        ]
      },
      {
        "id": "mvc_l4",
        "title": "Line Integrals",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Parametrize the line segment from (0,0) to (2,3) and write the parametric equations r(t).",
            "answer": "r(t) = ⟨2t, 3t⟩, t ∈ [0,1]"
          },
          {
            "difficulty": "Medium",
            "question": "Verify that F = ⟨2xy, x²⟩ is conservative and find its potential function f.",
            "answer": "f(x,y) = x²y + C"
          },
          {
            "difficulty": "Hard",
            "question": "Compute ∫_C F·dr for F=⟨2xy, x²⟩ from (0,0) to (3,2) using the potential function.",
            "answer": "18"
          }
        ]
      },
      {
        "id": "mvc_l5",
        "title": "Green's, Stokes' & Divergence Theorems",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Compute ∂Q/∂x − ∂P/∂y for P=3y, Q=2x. What does a non-zero result tell you in Green's theorem?",
            "answer": "∂Q/∂x − ∂P/∂y = 2−3 = −1; indicates net circulation is non-zero."
          },
          {
            "difficulty": "Medium",
            "question": "Use Green's theorem to compute ∮_C (y dx + x dy) where C is the unit circle (counterclockwise).",
            "answer": "0"
          },
          {
            "difficulty": "Hard",
            "question": "Use the Divergence Theorem to find the flux of F=⟨x,y,z⟩ through the closed surface of the unit cube [0,1]³.",
            "answer": "3"
          }
        ]
      },
      {
        "id": "mvc_l6",
        "title": "Taylor Series in Multiple Variables",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the Hessian matrix for f(x,y) = x² + 3y².",
            "answer": "H = [[2, 0],[0, 6]]"
          },
          {
            "difficulty": "Medium",
            "question": "Classify the critical point of f(x,y) = x² − 2xy + y² using the Hessian test.",
            "answer": "Inconclusive (det H = 0) — degenerate critical point (saddle-like ridge)"
          },
          {
            "difficulty": "Hard",
            "question": "Find and classify all critical points of f(x,y) = x⁴ + y⁴ − 4xy.",
            "answer": "Saddle at (0,0); local minima at (1,1) and (−1,−1)"
          }
        ]
      }
    ]
  },
  {
    "id": "diff_equations",
    "title": "Differential Equations",
    "level": "Expert",
    "color": "#FFB830",
    "icon": "y'",
    "lessons": [
      {
        "id": "de_l1",
        "title": "Separable Equations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the general solution of dy/dx = 3y.",
            "answer": "y = Ce^(3x)"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: dy/dx = x/y with y(0) = 3.",
            "answer": "y = √(x² + 9)"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: dy/dx = (y−1)(y+1) with y(0) = 0.",
            "answer": "y = −tanh(x)"
          }
        ]
      },
      {
        "id": "de_l2",
        "title": "Linear First-Order ODEs",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the integrating factor for y' + 5y = 10.",
            "answer": "μ(x) = e^(5x)"
          },
          {
            "difficulty": "Medium",
            "question": "Solve: y' + (1/x)y = x, y(1) = 2.",
            "answer": "y = x²/3 + 5/(3x)"
          },
          {
            "difficulty": "Hard",
            "question": "Solve the Bernoulli equation: y' + y = y², y(0) = 2.",
            "answer": "y = 1/(1 − (1/2)eˣ)"
          }
        ]
      },
      {
        "id": "de_l3",
        "title": "Applications: Exponential Growth & Newton's Law",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A bacteria culture doubles every 4 hours. Write the population model and find the doubling time constant k.",
            "answer": "y = y₀e^(kt), k = ln2/4 ≈ 0.173 per hour"
          },
          {
            "difficulty": "Medium",
            "question": "Carbon-14 has a half-life of 5730 years. A sample has 40% of its original C-14 remaining. How old is the sample?",
            "answer": "≈ 7575 years"
          },
          {
            "difficulty": "Hard",
            "question": "A cup of coffee at 90°C cools in a 20°C room. After 10 min it is 70°C. Find the temperature after 30 min.",
            "answer": "≈ 46.5°C"
          }
        ]
      },
      {
        "id": "de_l4",
        "title": "Second-Order Linear ODEs",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the characteristic equation for y'' − 4y = 0 and give the general solution.",
            "answer": "r²−4=0 → r=±2; y=C₁e^(2x)+C₂e^(−2x)"
          },
          {
            "difficulty": "Medium",
            "question": "Solve y'' + 4y = 0, y(0) = 1, y'(0) = 2.",
            "answer": "y = cos(2x) + sin(2x)"
          },
          {
            "difficulty": "Hard",
            "question": "Solve y'' − 6y' + 9y = 0, y(0) = 2, y'(0) = 5.",
            "answer": "y = (2 − x)e^(3x)"
          }
        ]
      },
      {
        "id": "de_l5",
        "title": "Non-Homogeneous ODEs & Undetermined Coefficients",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "What is the correct guess for yₚ when solving y'' − y = 5eˣ, given that eˣ is part of the complementary solution?",
            "answer": "yₚ = Axeˣ"
          },
          {
            "difficulty": "Medium",
            "question": "Find the particular solution of y'' + y' − 2y = 4x.",
            "answer": "yₚ = −2x − 1"
          },
          {
            "difficulty": "Hard",
            "question": "Find the general solution of y'' + y = sin x.",
            "answer": "y = C₁cos x + C₂sin x − (x/2)cos x"
          }
        ]
      },
      {
        "id": "de_l6",
        "title": "Systems of ODEs & Laplace Transforms",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find the Laplace transform of f(t) = 4e^(2t) + 3sin(t).",
            "answer": "F(s) = 4/(s−2) + 3/(s²+1)"
          },
          {
            "difficulty": "Medium",
            "question": "Solve using Laplace: y' + 3y = 6, y(0) = 0.",
            "answer": "y = 2(1 − e^(−3t))"
          },
          {
            "difficulty": "Hard",
            "question": "Use Laplace transforms to solve y'' + 4y' + 4y = 0, y(0) = 1, y'(0) = 0.",
            "answer": "y = (1 + 2t)e^(−2t)"
          }
        ]
      }
    ]
  },
  {
    "id": "linear_algebra",
    "title": "Linear Algebra",
    "level": "Expert",
    "color": "#8B5CF6",
    "icon": "λ",
    "lessons": [
      {
        "id": "la_l1",
        "title": "Vector Spaces & Subspaces",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Is W = {(x,y) : y = 2x} a subspace of ℝ²?",
            "answer": "Yes — W is a subspace."
          },
          {
            "difficulty": "Medium",
            "question": "Is W = {(x,y,z) : x²+y²+z²=1} a subspace of ℝ³?",
            "answer": "No — W is not a subspace."
          },
          {
            "difficulty": "Hard",
            "question": "Prove that if U and V are subspaces of a vector space W, then U∩V is also a subspace.",
            "answer": "U∩V satisfies all three subspace conditions."
          }
        ]
      },
      {
        "id": "la_l2",
        "title": "Basis, Dimension & Rank",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Are the vectors ⟨1,0⟩ and ⟨0,1⟩ a basis for ℝ²?",
            "answer": "Yes — they are linearly independent and span ℝ²."
          },
          {
            "difficulty": "Medium",
            "question": "Find the rank and nullity of A = [[1,2,1],[0,1,3],[2,5,7]].",
            "answer": "Rank = 3, Nullity = 0"
          },
          {
            "difficulty": "Hard",
            "question": "Let T: ℝ³→ℝ³ be defined by the matrix A = [[1,2,3],[0,0,0],[4,5,6]]. Find dim(ker T) and dim(im T), and verify rank-nullity.",
            "answer": "rank = 2, nullity = 1; 2+1 = 3 ✓"
          }
        ]
      },
      {
        "id": "la_l3",
        "title": "Linear Transformations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Is T(x,y) = (x+y, 0) a linear transformation? Verify the two linearity conditions.",
            "answer": "Yes — T is linear."
          },
          {
            "difficulty": "Medium",
            "question": "Find ker(T) and im(T) for T(x,y,z) = (x+y, y+z) represented by matrix [[1,1,0],[0,1,1]].",
            "answer": "ker(T) = span{⟨1,−1,1⟩}; im(T) = ℝ²"
          },
          {
            "difficulty": "Hard",
            "question": "Let T: ℝ³→ℝ³ be represented by A = [[1,0,1],[0,1,1],[1,1,2]]. Is T injective? Surjective?",
            "answer": "Not injective (ker ≠ {0}); not surjective (rank < 3)"
          }
        ]
      },
      {
        "id": "la_l4",
        "title": "Eigenvalues & Eigenvectors",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "For A = [[5,0],[0,3]], state the eigenvalues and eigenvectors without computing.",
            "answer": "λ₁=5 with eigenvector ⟨1,0⟩; λ₂=3 with eigenvector ⟨0,1⟩"
          },
          {
            "difficulty": "Medium",
            "question": "Find the eigenvalues of A = [[2,1],[1,2]] and the eigenvector for each.",
            "answer": "λ₁=1 with eigenvector ⟨1,−1⟩; λ₂=3 with eigenvector ⟨1,1⟩"
          },
          {
            "difficulty": "Hard",
            "question": "Verify the Cayley–Hamilton theorem for A = [[3,1],[1,3]]: show that A² − 6A + 8I = 0.",
            "answer": "A²−6A+8I = [[0,0],[0,0]] ✓"
          }
        ]
      },
      {
        "id": "la_l5",
        "title": "Diagonalisation",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A = PDP⁻¹ with D=[[2,0],[0,5]] and P=[[1,1],[0,1]]. Compute A³ using A³=PD³P⁻¹.",
            "answer": "A³ = [[8, 117],[0, 125]]"
          },
          {
            "difficulty": "Medium",
            "question": "Diagonalise A = [[2,1],[1,2]] (eigenvalues: 1 and 3, eigenvectors: ⟨1,−1⟩ and ⟨1,1⟩).",
            "answer": "A = PDP⁻¹ with P=[[1,1],[−1,1]], D=[[1,0],[0,3]]"
          },
          {
            "difficulty": "Hard",
            "question": "Use diagonalisation to find a closed form for Aⁿ where A = [[2,1],[1,2]].",
            "answer": "Aⁿ = ½[(3ⁿ+1)I + (3ⁿ−1)J] where... more precisely: Aⁿ = [[(3ⁿ+1)/2, (3ⁿ−1)/2],[(3ⁿ−1)/2, (3ⁿ+1)/2]]"
          }
        ]
      },
      {
        "id": "la_l6",
        "title": "Inner Product Spaces & Gram-Schmidt",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Are v₁=⟨1,0,1⟩ and v₂=⟨0,1,0⟩ orthogonal? Find the norm of v₁.",
            "answer": "Yes, orthogonal; ‖v₁‖=√2"
          },
          {
            "difficulty": "Medium",
            "question": "Apply Gram-Schmidt to v₁=⟨1,1⟩ and v₂=⟨1,0⟩ to find an orthonormal basis.",
            "answer": "e₁=⟨1/√2,1/√2⟩; e₂=⟨1/√2,−1/√2⟩"
          },
          {
            "difficulty": "Hard",
            "question": "The least-squares solution to Ax=b minimises ‖Ax−b‖². Show that the normal equations are AᵀAx=Aᵀb, and solve for x given A=[[1,1],[1,2],[1,3]], b=⟨1,2,2⟩.",
            "answer": "x ≈ (1/2, 1/2) — i.e., intercept=1/2, slope=1/2"
          }
        ]
      }
    ]
  },
  {
    "id": "discrete_math",
    "title": "Discrete Mathematics",
    "level": "Expert",
    "color": "#06B6D4",
    "icon": "∀",
    "lessons": [
      {
        "id": "dm_l1",
        "title": "Proof Techniques",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Prove by direct proof: if n is even, then n² is even.",
            "answer": "n=2k → n²=4k²=2(2k²), which is even."
          },
          {
            "difficulty": "Medium",
            "question": "Prove by contradiction: √2 is irrational.",
            "answer": "Assume √2=p/q in lowest terms → 2q²=p² → p even → p=2m → 2q²=4m² → q even → contradiction."
          },
          {
            "difficulty": "Hard",
            "question": "Prove by induction: for all n≥1, 1+2+3+…+n = n(n+1)/2.",
            "answer": "Base: n=1 gives 1=1(2)/2=1 ✓. Inductive step: assume true for n=k; show for n=k+1."
          }
        ]
      },
      {
        "id": "dm_l2",
        "title": "Modular Arithmetic",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Find 17 mod 5 and verify that 17 ≡ 2 (mod 5).",
            "answer": "17 mod 5 = 2; 17 − 2 = 15 = 5×3, so 5 | 15 ✓"
          },
          {
            "difficulty": "Medium",
            "question": "Compute 3^50 mod 7 using Fermat's Little Theorem.",
            "answer": "2"
          },
          {
            "difficulty": "Hard",
            "question": "Solve: 3x ≡ 7 (mod 11).",
            "answer": "x ≡ 6 (mod 11)"
          }
        ]
      },
      {
        "id": "dm_l3",
        "title": "Recurrence Relations",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Write the characteristic equation for the recurrence aₙ = 3aₙ₋₁ + 4aₙ₋₂.",
            "answer": "r² = 3r + 4, or r² − 3r − 4 = 0"
          },
          {
            "difficulty": "Medium",
            "question": "Solve the recurrence aₙ = 4aₙ₋₁ − 4aₙ₋₂, a₀ = 1, a₁ = 4.",
            "answer": "aₙ = (1 + n)·2ⁿ"
          },
          {
            "difficulty": "Hard",
            "question": "Use the Master Theorem to classify T(n) = 4T(n/2) + n.",
            "answer": "T(n) = Θ(n²)"
          }
        ]
      },
      {
        "id": "dm_l4",
        "title": "Algorithm Analysis & Big-O",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Simplify to Big-O: f(n) = 7n³ + 15n² + 1000.",
            "answer": "f(n) = O(n³)"
          },
          {
            "difficulty": "Medium",
            "question": "An algorithm does the following: an outer loop runs n times, an inner loop runs log₂n times, and each iteration does O(1) work. What is the overall time complexity?",
            "answer": "O(n log n)"
          },
          {
            "difficulty": "Hard",
            "question": "Prove formally that 2n² + 5n + 3 = O(n²) by finding explicit constants c and n₀ in the definition f(n) ≤ c·g(n) for all n ≥ n₀.",
            "answer": "c = 10, n₀ = 1 works (or many other valid pairs)"
          }
        ]
      },
      {
        "id": "dm_l5",
        "title": "Boolean Algebra & Logic Gates",
        "duration": "11 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Use De Morgan's law to simplify (A·B)'.\" ",
            "answer": "A' + B'"
          },
          {
            "difficulty": "Medium",
            "question": "Build a truth table for A·B + A'·B. Simplify the expression.",
            "answer": "A·B + A'·B = B"
          },
          {
            "difficulty": "Hard",
            "question": "Simplify using Boolean algebra: Y = A·B·C + A·B·C' + A·B'·C.",
            "answer": "Y = A·B + A·B'·C = A(B + B'C)"
          }
        ]
      },
      {
        "id": "dm_l6",
        "title": "P vs NP & Computability",
        "duration": "12 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "Is sorting a list of n numbers in P, NP, or both?",
            "answer": "P (and therefore also in NP)"
          },
          {
            "difficulty": "Medium",
            "question": "The Subset Sum problem: given a set of integers, does any subset sum to exactly 0? Explain why it is in NP.",
            "answer": "Given a subset (certificate), we can verify it sums to 0 in polynomial time → NP."
          },
          {
            "difficulty": "Hard",
            "question": "Explain Turing's diagonalisation argument for the Halting Problem. Why is it undecidable?",
            "answer": "No program H can decide halting for all programs; any such H leads to a program that contradicts itself."
          }
        ]
      }
    ]
  },
  {
    "id": "probability_theory",
    "title": "Probability Theory",
    "level": "Expert",
    "color": "#EC4899",
    "icon": "P(Ω)",
    "lessons": [
      {
        "id": "pt_l1",
        "title": "Measure-Theoretic Probability",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "P(A) = 0.3 and P(B) = 0.5. If A and B are mutually exclusive, find P(A∪B).",
            "answer": "P(A∪B) = 0.8"
          },
          {
            "difficulty": "Medium",
            "question": "Prove from the Kolmogorov axioms that P(Aᶜ) = 1 − P(A).",
            "answer": "A and Aᶜ are disjoint and their union is Ω; apply countable additivity and P(Ω)=1."
          },
          {
            "difficulty": "Hard",
            "question": "Use the inclusion-exclusion principle to find P(A∪B∪C) given P(A)=0.4, P(B)=0.3, P(C)=0.2, P(A∩B)=0.1, P(A∩C)=0.08, P(B∩C)=0.06, P(A∩B∩C)=0.02.",
            "answer": "P(A∪B∪C) = 0.68"
          }
        ]
      },
      {
        "id": "pt_l2",
        "title": "Random Variables & Distributions",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A random variable X has PMF P(X=1)=0.2, P(X=2)=0.5, P(X=3)=0.3. Find P(X≤2).",
            "answer": "P(X≤2) = 0.7"
          },
          {
            "difficulty": "Medium",
            "question": "X has PDF f(x) = 2x on [0,1]. Find E[X] and Var(X).",
            "answer": "E[X] = 2/3; Var(X) = 1/18"
          },
          {
            "difficulty": "Hard",
            "question": "X has CDF F(x)=0 for x<0, F(x)=x² for 0≤x≤1, F(x)=1 for x>1. Find (a) the PDF, (b) P(0.3≤X≤0.7), (c) the median.",
            "answer": "(a) f(x)=2x on [0,1]; (b) 0.4; (c) m=1/√2≈0.707"
          }
        ]
      },
      {
        "id": "pt_l3",
        "title": "Moment Generating Functions",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "X ~ Exponential(λ=2). Write its MGF M_X(t) and state for what values of t it exists.",
            "answer": "M_X(t) = 2/(2−t), valid for t < 2"
          },
          {
            "difficulty": "Medium",
            "question": "Use the MGF of X ~ N(μ,σ²) to find E[X] and E[X²].",
            "answer": "E[X] = μ; E[X²] = σ² + μ²"
          },
          {
            "difficulty": "Hard",
            "question": "X ~ N(0,1) and Y ~ N(0,1) are independent. Use MGFs to find the distribution of Z = X+Y.",
            "answer": "Z ~ N(0,2)"
          }
        ]
      },
      {
        "id": "pt_l4",
        "title": "Law of Large Numbers & Central Limit Theorem",
        "duration": "14 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "X has mean μ=10 and σ=4. You take a sample of n=64. What is the standard error of the sample mean?",
            "answer": "SE = σ/√n = 4/8 = 0.5"
          },
          {
            "difficulty": "Medium",
            "question": "X ~ Poisson(λ=9). Approximate P(x̄₁₀₀ > 9.5) using the CLT (n=100 observations).",
            "answer": "≈ 0.0475"
          },
          {
            "difficulty": "Hard",
            "question": "State the difference between the Weak and Strong Laws of Large Numbers. Give one practical implication of each.",
            "answer": "WLLN: convergence in probability (for any ε, P(|x̄_n−μ|>ε)→0). SLLN: almost sure convergence (x̄_n→μ with probability 1)."
          }
        ]
      },
      {
        "id": "pt_l5",
        "title": "Markov Chains",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "A Markov chain has transition matrix P = [[0.8,0.2],[0.3,0.7]]. Starting in state 1, what is the probability of being in state 2 after 1 step?",
            "answer": "P(state 2 after 1 step | start state 1) = 0.2"
          },
          {
            "difficulty": "Medium",
            "question": "For P = [[0.8,0.2],[0.3,0.7]], find the steady-state distribution π.",
            "answer": "π = (3/5, 2/5)"
          },
          {
            "difficulty": "Hard",
            "question": "A random walk on {0,1,2} has absorbing states at 0 and 2, and from state 1 the chain moves to 0 or 2 each with probability 1/2. Starting at state 1, what is the probability of being absorbed at state 2?",
            "answer": "1/2"
          }
        ]
      },
      {
        "id": "pt_l6",
        "title": "Bayesian Inference",
        "duration": "13 min",
        "practice": [
          {
            "difficulty": "Easy",
            "question": "State Bayes' theorem and identify each term.",
            "answer": "P(H|E) = P(E|H)·P(H)/P(E); P(H) = prior; P(E|H) = likelihood; P(H|E) = posterior; P(E) = marginal."
          },
          {
            "difficulty": "Medium",
            "question": "An email is spam with prior probability 0.2. A spam filter detects \"free\" in 90% of spam and 5% of legitimate emails. If \"free\" is found, what is the posterior probability the email is spam?",
            "answer": "≈ 0.818"
          },
          {
            "difficulty": "Hard",
            "question": "Explain the core philosophical difference between Bayesian and Frequentist inference. Give one scenario where they give different answers.",
            "answer": "Bayesian: probability is a degree of belief; parameters have distributions. Frequentist: probability is long-run frequency; parameters are fixed unknowns."
          }
        ]
      }
    ]
  }
];


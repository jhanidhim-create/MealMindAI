import { useState, useEffect } from "react";
import "./App.css";

const MEAL_TIMES = {
  Breakfast: {
    servingHour: 10,
    servingMinute: 0,
    cutoffHour: 8,
    cutoffMinute: 30,
    icon: "🌅",
  },
  Lunch: {
    servingHour: 13,
    servingMinute: 0,
    cutoffHour: 11,
    cutoffMinute: 30,
    icon: "☀️",
  },
  Dinner: {
    servingHour: 21,
    servingMinute: 30,
    cutoffHour: 20,
    cutoffMinute: 0,
    icon: "🌙",
  },
};

function App() {
  const [page, setPage] = useState("home");

  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem("mealResponses");
    return saved ? JSON.parse(saved) : [];
  });

  const addResponse = (response) => {
    const updated = [...responses, response];
    setResponses(updated);
    localStorage.setItem("mealResponses", JSON.stringify(updated));
  };

  if (page === "confirmation") {
    return (
      <MealConfirmation
        setPage={setPage}
        addResponse={addResponse}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        setPage={setPage}
        responses={responses}
      />
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          🍃 MealMind AI
        </div>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("confirmation")}>
            Confirm Meal
          </button>

          <button onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="tag">
            SMART FOOD MANAGEMENT
          </div>

          <h1>
            Predict Smart.
            <br />
            <span>Waste Less.</span>
          </h1>

          <p>
            MealMind AI helps college messes predict meal demand before food is
            prepared, reducing food waste and promoting sustainable consumption.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => setPage("confirmation")}
            >
              Confirm Your Meal →
            </button>

            <button
              className="secondary-btn"
              onClick={() => setPage("dashboard")}
            >
              View Dashboard
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="food-icon">🍽️</div>

          <h2>Smart Meal Planning</h2>

          <p>
            Confirm → Lock → Predict → Prepare
          </p>

          <div className="mini-stats">
            <div>
              <strong>3</strong>
              <span>Meals Daily</span>
            </div>

            <div>
              <strong>1.5h</strong>
              <span>Lock Before</span>
            </div>

            <div>
              <strong>AI</strong>
              <span>Prediction</span>
            </div>
          </div>
        </div>
      </main>

      <section className="how-it-works">
        <h2>How MealMind AI Works</h2>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Confirm</h3>
            <p>Students confirm their preferred meals.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Lock</h3>
            <p>Responses close 1.5 hours before meal time.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Predict</h3>
            <p>The system estimates the required food quantity.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Prepare</h3>
            <p>The mess prepares food based on final demand.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


function MealConfirmation({ setPage, addResponse }) {
  const [name, setName] = useState("");
  const [meal, setMeal] = useState("Breakfast");
  const [choice, setChoice] = useState("Yes");
  const [confirmed, setConfirmed] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
const getMealStatus = (mealName) => {
  const now = new Date();

  const mealInfo = MEAL_TIMES[mealName];

  const cutoffTime = new Date();
  cutoffTime.setHours(
    mealInfo.cutoffHour,
    mealInfo.cutoffMinute,
    0,
    0
  );
  if (now < cutoffTime) {
    return {
      status: "open",
      message: `Open for today's meal until ${formatTime(cutoffTime)}`,
    };
  }

  if (now >= cutoffTime && now < servingTime) {
    return {
      status: "locked",
      message: "Confirmation locked. Final count is being prepared.",
    };
  }

  return {
    status: "open",
    message: "Open for tomorrow's meal",
  };
};
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedMealStatus = getMealStatus(meal);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name!");
      return;
    }

    if (selectedMealStatus.status !== "open") {
      alert("Meal confirmation is currently closed!");
      return;
    }
const now = new Date();

const mealInfo = MEAL_TIMES[meal];

const servingTime = new Date();
servingTime.setHours(
  mealInfo.servingHour,
  mealInfo.servingMinute,
  0,
  0
);

const mealDate = new Date();

if (now >= servingTime) {
  mealDate.setDate(mealDate.getDate() + 1);
}

const response = {
  name,
  meal,
  choice,
  mealDate: mealDate.toLocaleDateString(),
  submittedTime: now.toLocaleTimeString(),
};
    addResponse(response);

    setConfirmed(true);
  };

  return (
    <div className="form-page">
      <nav className="navbar">
        <div className="logo">
          🍃 MealMind AI
        </div>

        <button
          className="back-btn"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>
      </nav>

      <div className="form-container">

        {!confirmed ? (
          <>
            <div className="form-header">
              <span>🍽️</span>
              <h1>Confirm Your Meal</h1>
              <p>
                Current Time: {currentTime.toLocaleTimeString()}
              </p>
            </div>

            <div className="meal-timing-info">
              <h3>Today's Meal Schedule</h3>

              <div className="timing-row">
                <span>🌅 Breakfast</span>
                <span>10:00 AM</span>
                <small>Closes: 8:30 AM</small>
              </div>

              <div className="timing-row">
                <span>☀️ Lunch</span>
                <span>1:00 PM</span>
                <small>Closes: 11:30 AM</small>
              </div>

              <div className="timing-row">
                <span>🌙 Dinner</span>
                <span>9:30 PM</span>
                <small>Closes: 8:00 PM</small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Student Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Select Meal</label>

              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              >
                <option value="Breakfast">
                  🌅 Breakfast
                </option>

                <option value="Lunch">
                  ☀️ Lunch
                </option>

                <option value="Dinner">
                  🌙 Dinner
                </option>
              </select>

              <div
                className={`meal-status ${selectedMealStatus.status}`}
              >
                {selectedMealStatus.status === "open" && "🟢 "}
                {selectedMealStatus.status === "locked" && "🔒 "}
                {selectedMealStatus.status === "completed" && "⏳ "}

                {selectedMealStatus.message}
              </div>

              {selectedMealStatus.status === "open" && (
                <>
                  <label>Will you have this meal?</label>

                  <div className="choice">
                    <input
                      type="radio"
                      name="mealChoice"
                      checked={choice === "Yes"}
                      onChange={() => setChoice("Yes")}
                    />

                    <span>
                      Yes, I will have the meal
                    </span>
                  </div>

                  <div className="choice">
                    <input
                      type="radio"
                      name="mealChoice"
                      checked={choice === "No"}
                      onChange={() => setChoice("No")}
                    />

                    <span>
                      No, I will not have the meal
                    </span>
                  </div>

                  <button
                    className="primary-btn submit-btn"
                    type="submit"
                  >
                    Submit Confirmation
                  </button>
                </>
              )}

              {selectedMealStatus.status !== "open" && (
                <div className="locked-message">
                  🔒 This meal confirmation is currently locked.
                  <br />
                  The mess authority can now view the final count.
                </div>
              )}

            </form>
          </>
        ) : (
          <div className="success-box">
            <div className="success-icon">✓</div>

            <h1>Response Recorded!</h1>

            <p>
              Thank you, <strong>{name}</strong>!
            </p>

            <p>
              Your {meal} confirmation has been successfully recorded.
            </p>

            <button
              className="primary-btn"
              onClick={() => setPage("dashboard")}
            >
              View Smart Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function Dashboard({ setPage, responses }) {

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
const getMealData = (mealName) => {
  const mealInfo = MEAL_TIMES[mealName];

  const servingTime = new Date();
  servingTime.setHours(
    mealInfo.servingHour,
    mealInfo.servingMinute,
    0,
    0
  );

  const targetDate = new Date();

  if (currentTime >= servingTime) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const targetDateString = targetDate.toLocaleDateString();

  const mealResponses = responses.filter(
    (response) =>
      response.meal === mealName &&
      response.choice === "Yes" &&
      response.mealDate === targetDateString
  );

  const count = mealResponses.length;

  const cutoffTime = new Date();
  cutoffTime.setHours(
    mealInfo.cutoffHour,
    mealInfo.cutoffMinute,
    0,
    0
  );

  let status = "open";

  if (
    currentTime >= cutoffTime &&
    currentTime < servingTime
  ) {
    status = "locked";
  }

  // Prediction with 10% safety buffer
  const predicted = Math.ceil(count * 1.1);
    return {
      count,
      predicted,
      status,
      info: mealInfo,
    };
  };

  const breakfast = getMealData("Breakfast");
  const lunch = getMealData("Lunch");
  const dinner = getMealData("Dinner");

  const totalConfirmed =
    breakfast.count +
    lunch.count +
    dinner.count;

  const totalPredicted =
    breakfast.predicted +
    lunch.predicted +
    dinner.predicted;

  return (
    <div className="dashboard-page">

      <nav className="navbar">
        <div className="logo">
          🍃 MealMind AI
        </div>

        <button
          className="back-btn"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>
      </nav>

      <div className="dashboard">

        <div className="dashboard-header">
          <div>
            <p className="tag">
              MESS AUTHORITY PANEL
            </p>

            <h1>Today's Meal Dashboard</h1>

            <p>
              Live meal confirmations and final demand prediction.
            </p>
          </div>

          <div className="live-badge">
            ● {currentTime.toLocaleTimeString()}
          </div>
        </div>


        <div className="meal-dashboard-grid">

          <MealCard
            title="Breakfast"
            data={breakfast}
          />

          <MealCard
            title="Lunch"
            data={lunch}
          />

          <MealCard
            title="Dinner"
            data={dinner}
          />

        </div>


        <div className="total-summary">

          <div>
            <p className="tag">
              TODAY'S TOTAL DEMAND
            </p>

            <h2>
              {totalConfirmed} Confirmations
            </h2>

            <p>
              Total predicted preparation: {totalPredicted} meals
            </p>
          </div>

          <div className="total-circle">
            <strong>{totalPredicted}</strong>
            <span>Total Meals</span>
          </div>

        </div>


        <div className="insight-box">
          <h3>💡 MealMind AI Smart Insight</h3>

          <p>
            Each meal has an independent confirmation deadline.
            Once the deadline is reached, student responses are locked,
            giving the mess authority a stable final count before
            food preparation begins.
          </p>
        </div>

      </div>
    </div>
  );
}


function MealCard({ title, data }) {

  return (
    <div className="meal-card">

      <div className="meal-card-header">
        <span className="meal-big-icon">
          {data.info.icon}
        </span>

        <div>
          <h2>{title}</h2>

          <p>
            Serving: {
              title === "Breakfast"
                ? "10:00 AM"
                : title === "Lunch"
                ? "1:00 PM"
                : "9:30 PM"
            }
          </p>
        </div>
      </div>

      <div className={`status-badge ${data.status}`}>
        {data.status === "open" && "🟢 Confirmation Open"}

        {data.status === "locked" &&
          "🔒 Final Count Locked"}
      </div>

      <div className="meal-numbers">

        <div>
          <span>Confirmed</span>
          <strong>{data.count}</strong>
        </div>

        <div>
          <span>Predicted</span>
          <strong>{data.predicted}</strong>
        </div>

      </div>

      {data.status === "locked" && (
        <div className="final-count">
          Final preparation count: {data.predicted} meals
        </div>
      )}

    </div>
  );
}


export default App;
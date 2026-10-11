import { useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import { useState, useEffect } from "react";
import "./App.css";
import StaffLogin from "./StaffLogin";
import { supabase } from "./supabase.js";
import { studentSupabase } from "./studentSupabase.js";
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

const [staffLoggedIn, setStaffLoggedIn] = useState(false);

useEffect(() => {
  let active = true;

  async function checkStaffSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: staff, error } = await supabase
          .from("canteen_staff")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!active) return;

        if (error || !staff) {
          await supabase.auth.signOut();
          setStaffLoggedIn(false);
        } else {
          setStaffLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Staff session check failed:", error);
    } finally {
      if (active) {
        // Session check finished
      }
    }
  }

  checkStaffSession();

  return () => {
    active = false;
  };
}, []);

  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem("mealResponses");
    return saved ? JSON.parse(saved) : [];
  });

  const addResponse = (response) => {
    const updated = [...responses, response];
    setResponses(updated);
    localStorage.setItem("mealResponses", JSON.stringify(updated));
  };

if (page === "staff-login") {
  return (
    <StaffLogin
      onLogin={() => {
        setStaffLoggedIn(true);
        setPage("dashboard");
      }}
      onBack={() => setPage("home")}
    />
  );
}

if (page === "dashboard" && !staffLoggedIn) {
  return (
    <StaffLogin
      onLogin={() => {
        setStaffLoggedIn(true);
        setPage("dashboard");
      }}
      onBack={() => setPage("home")}
    />
  );
}

  if (page === "confirmation") {
    return (
      <MealConfirmation
        setPage={setPage}
        addResponse={addResponse}
      />
    );
  }
  
  if (page === "history") {
  return <MealHistory setPage={setPage} />;
}

if (page === "dashboard") {
  return (
    <Dashboard
      setPage={setPage}
      responses={responses}
      onLogout={async () => {
        await supabase.auth.signOut();
        setStaffLoggedIn(false);
        setPage("home");
      }}
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

          
<button onClick={() => setPage("staff-login")}>
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
            MealMind AI helps college messes predict meal demand before food
            is prepared, reducing food waste and promoting sustainable
            consumption.
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
  onClick={() => setPage("history")}
>
  Meal History →
</button>

            <button
              className="secondary-btn"
              onClick={() => setPage("staff-login")}
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

function MealHistory({ setPage }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const {
          data: { user },
          error: userError,
        } = await studentSupabase.auth.getUser();

        if (userError || !user?.email) {
          throw new Error(
            "Student login nahi mila. Pehle apne student email se meal confirm karo."
          );
        }

        const { data, error: queryError } = await studentSupabase
          .from("meal_confirmations")
          .select(
  "id, student_name, meal_type, meal_date, confirmation_token, status, confirmed_at, scanned_at"
)
          .ilike("student_email", user.email)
          .order("confirmed_at", { ascending: false });

        if (queryError) throw queryError;

        
const historyWithQR = await Promise.all(
  (data || []).map(async (meal) => {
    if (meal.status !== "unused" || !meal.confirmation_token) {
      return { ...meal, qrDataUrl: null };
    }

    const qrDataUrl = await QRCode.toDataURL(
      meal.confirmation_token,
      { width: 240, margin: 2 }
    );

    return { ...meal, qrDataUrl };
  })
);

if (active) setRecords(historyWithQR);

      } catch (err) {
        if (active) {
          setError(err.message || "Meal history load nahi hui.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [refreshCount]);

  return (
    <div className="app-container">
      <h1>Meal History 📋</h1>
      <p>Your previous meal confirmations</p>

      {loading && <p>Loading meal history...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && records.length === 0 && (
        <p>Abhi koi meal record nahi mila.</p>
      )}

      {records.map((meal) => (
        <div className="meal-history-card" key={meal.id}>
          <h3>{meal.meal_type}</h3>
          <p>Date: {meal.meal_date}</p>
          <p>Status: {meal.status}</p>
          
{meal.status === "unused" && meal.qrDataUrl && (
  <div>
    <p>Show this QR code to the canteen staff.</p>
    <img
      src={meal.qrDataUrl}
      alt={`${meal.meal_type} meal pass QR code`}
      width="200"
      height="200"
    />
  </div>
)}

          <p>
            Confirmed:{" "}
            {meal.confirmed_at
              ? new Date(meal.confirmed_at).toLocaleString()
              : "N/A"}
          </p>
          {meal.scanned_at && (
            <p>
              Scanned: {new Date(meal.scanned_at).toLocaleString()}
            </p>
          )}
        </div>
      ))}

      
      <button
        className="secondary-btn"
        onClick={() => {
          setLoading(true);
          setError("");
          setRefreshCount((count) => count + 1);
        }}
      >
        ↻ Refresh History
      </button>

      <button
        className="secondary-btn"
        onClick={() => setPage("home")}
      >
        ← Back to Home
      </button>

    </div>
  );
}


function MealConfirmation({ setPage, addResponse }) {

  const [name, setName] = useState("");
  const [meal, setMeal] = useState("Breakfast");
  const [confirmed, setConfirmed] = useState(false);
  const [mealPass, setMealPass] = useState(null);
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [otpSent, setOtpSent] = useState(false);
const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


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

    const servingTime = new Date();
    servingTime.setHours(
      mealInfo.servingHour,
      mealInfo.servingMinute,
      0,
      0
    );


    // Before cutoff → Today's meal booking is open
    if (now < cutoffTime) {
      return {
        status: "open",
        message: `Open for today's meal until ${formatTime(cutoffTime)}`,
      };
    }


    // Between cutoff and serving → Booking locked
    if (now >= cutoffTime && now < servingTime) {
      return {
        status: "locked",
        message: "Confirmation locked. Final count is being prepared.",
      };
    }


    // After serving → Tomorrow's meal booking opens
    return {
      status: "open",
      message: "Open for tomorrow's meal",
    };
  };


  const selectedMealStatus = getMealStatus(meal);


  

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name.trim()) {
    alert("Please enter your name!");
    return;
  }

  if (!email.trim()) {
    alert("Please enter your email!");
    return;
  }

  if (selectedMealStatus.status !== "open") {
    alert("Meal confirmation is currently closed!");
    return;
  }

  setSubmitting(true);
  setSubmitError("");

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Step 1: Send the email OTP
    if (!otpSent) {
      const { error } = await studentSupabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      alert("Verification code sent! Check your email.");
      return;
    }

    // Step 2: Verify the OTP
    if (!otp.trim()) {
      throw new Error("Please enter the email verification code.");
    }

    const { error: otpError } =
      await studentSupabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp.trim(),
        type: "email",
      });

    if (otpError) {
      throw new Error("Invalid or expired OTP. Please try again.");
    }

    // Step 3: Create the meal pass using the verified session
    const { data, error } =
      await studentSupabase.functions.invoke(
        "create-meal-pass",
        {
          body: {
            student_name: name.trim(),
            meal_type: meal,
          },
        }
      );

    if (error) throw error;

    if (!data?.success || !data?.meal_pass?.confirmation_token) {
      throw new Error(
        data?.error || "Could not create your meal pass."
      );
    }

    const savedPass = data.meal_pass;

    // Step 4: Generate the QR code
    const qrDataUrl = await QRCode.toDataURL(
      savedPass.confirmation_token,
      { width: 240, margin: 2 }
    );

    setMealPass({ ...savedPass, qrDataUrl });

    addResponse({
      name: savedPass.student_name,
      meal: savedPass.meal_type,
      mealDate: new Date(
        `${savedPass.meal_date}T00:00:00`
      ).toLocaleDateString(),
      submittedTime: new Date().toLocaleTimeString(),
    });

    setConfirmed(true);
  } catch (error) {
    console.error("Meal confirmation failed:", error);
    setSubmitError(
      error.message || "Confirmation failed. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
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
              
<label htmlFor="student-email">Student email</label>
<input
  id="student-email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email address"
  autoComplete="email"
  required
  disabled={otpSent}
/>

{otpSent && (
  <>
    <label htmlFor="student-otp">Email verification code</label>
    <input
      id="student-otp"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={otp}
      onChange={(e) =>
        setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
      }
      placeholder="Enter the code from your email"
      required
    />
  </>
)}



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

                {selectedMealStatus.message}

              </div>
{submitError && (
  <p role="alert">{submitError}</p>
)}

{selectedMealStatus.status === "open" && (
  <button
    className="primary-btn submit-btn"
    type="submit"
    disabled={submitting}
  >
    {submitting ? "Saving Confirmation..." : "Confirm Meal"}
  </button>
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

            <div className="success-icon">
              ✓
            </div>

            <h1>Response Recorded!</h1>

            <p>
              Thank you, <strong>{name}</strong>!
            </p>

            <p>
              Your {meal} confirmation has been successfully recorded.
            </p>
            
{mealPass && (
  <div className="meal-pass">
    <h2>Your Meal Pass</h2>
    <img
      src={mealPass.qrDataUrl}
      alt="Your unique meal pass QR code"
      width="240"
      height="240"
    />
    <p>Meal: {mealPass.meal_type}</p>
    <p>Date: {mealPass.meal_date}</p>
    <p>Status: Unused</p>
    <p>Show this QR code to the canteen staff.</p>
  </div>
)}


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


function Dashboard({ setPage, responses, onLogout }) {

  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    let scanner;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode("meal-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (cancelled || !scannerRef.current) return;

            try {
              await scannerRef.current.stop();
            } catch {}

            scannerRef.current = null;

            if (!cancelled) {
              setScanning(false);
              
setScanning(false);
setScanResult("Verifying meal pass...");
setScanError("");

try {
  const { data, error } = await supabase.functions.invoke(
    "verify-meal-pass",
    {
      body: { token: decodedText },
    }
  );

  if (error) throw error;

  if (data?.valid) {
    setScanResult(
      `✅ ${data.message || "VALID — SERVE MEAL"} | ${data.meal || ""} | ${data.date || ""}`
    );
  } else {
    setScanError(data?.message || "❌ Invalid or already used meal pass.");
  }
} catch (error) {
  setScanError(
    error.message || "Meal pass verification failed."
  );
}

            }
          },
          () => {}
        );

        if (!cancelled) setScanning(true);
      } catch (err) {
        if (!cancelled) {
          setScanError(
            "Camera start nahi hua. Browser permission check karo."
          );
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      const activeScanner = scannerRef.current;

      if (activeScanner) {
        activeScanner
          .stop()
          .catch(() => {})
          .finally(() => {
            activeScanner.clear().catch(() => {});
            if (scannerRef.current === activeScanner) {
              scannerRef.current = null;
            }
          });
      }
    };
  }, [scannerOpen]);



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


    // Decide whether dashboard is showing today's
    // or tomorrow's meal cycle
    const targetDate = new Date();

    if (currentTime >= servingTime) {
      targetDate.setDate(targetDate.getDate() + 1);
    }


    const targetDateString =
      targetDate.toLocaleDateString();


    const mealResponses = responses.filter(
      (response) =>
        response.meal === mealName &&
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


    // Add 1 extra meal for every 5 confirmations
    const predicted =
      count + Math.floor(count / 5);


    return {
      count,
      predicted,
      status,
      info: mealInfo,
    };
  };


  const breakfast =
    getMealData("Breakfast");

  const lunch =
    getMealData("Lunch");

  const dinner =
    getMealData("Dinner");


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

            <h1>
              Today's Meal Dashboard
            </h1>

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
        
        <div className="meal-scanner-section">
          <h2>📷 Scan Student Meal Pass</h2>
          <p>Scan the student's QR code to verify their meal pass.</p>

          {!scannerOpen && (
            <button
              className="primary-btn"
              onClick={() => {
                setScanResult("");
                setScanError("");
                setScannerOpen(true);
              }}
            >
              Open QR Scanner
            </button>
          )}

          {scannerOpen && (
            <>
              <div
                id="meal-qr-reader"
                style={{ width: "100%", maxWidth: "400px" }}
              />

              <button
                className="secondary-btn"
                onClick={() => {
                  setScannerOpen(false);
                  setScanning(false);
                }}
              >
                Stop Scanner
              </button>
            </>
          )}

          {scanning && <p>Camera is active. Point it at the meal QR.</p>}
          {scanError && <p>{scanError}</p>}
          {scanResult && <p>{scanResult}</p>}
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
              Total predicted preparation:
              {" "}
              {totalPredicted} meals
            </p>

          </div>


          <div className="total-circle">

            <strong>
              {totalPredicted}
            </strong>

            <span>
              Total Meals
            </span>

          </div>

        </div>


        <div className="insight-box">

          <h3>
            💡 MealMind AI Smart Insight
          </h3>

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

          <h2>
            {title}
          </h2>

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


      <div
        className={`status-badge ${data.status}`}
      >

        {data.status === "open" &&
          "🟢 Confirmation Open"}

        {data.status === "locked" &&
          "🔒 Final Count Locked"}

      </div>


      <div className="meal-numbers">

        <div>

          <span>
            Confirmed
          </span>

          <strong>
            {data.count}
          </strong>

        </div>


        <div>

          <span>
            Predicted
          </span>

          <strong>
            {data.predicted}
          </strong>

        </div>

      </div>


      {data.status === "locked" && (

        <div className="final-count">

          Final preparation count:
          {" "}
          {data.predicted}
          {" "}
          meals

        </div>

      )}

    </div>
  );
}


export default App;
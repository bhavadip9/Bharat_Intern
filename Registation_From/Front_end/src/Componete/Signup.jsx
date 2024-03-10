
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./style.css";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const history = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please enter your email and password");
            return;
        }

        axios
            .post("http://localhost:8000/signup", {
                email,
                password,
            })
            .then((res) => {
                if (password.length < 6) {
                    setError("Please enter Correct password");
                } else if (res.data === "exist") {
                    setError("User already exists. Please log in.");
                } else if (res.data === "notexist") {
                    history("/home", { state: { id: email } });
                }
            })
            .catch((error) => {
                setError("Error: Unable to process request");
                console.error(error);
            });
    };

    return (
        <div className="login">
            <h1>Signup Page </h1>
            <form onSubmit={handleSubmit}>
                <input
                    className="box"
                    type="email"
                    name="email"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    placeholder="Email"
                    value={email}
                />
                <br />
                <br />

                <input
                    className="box"
                    type="password"
                    name="password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    placeholder="password"
                    value={password}
                />
                <br />
                <br />

                <input type="submit" name="" value="Signup" className="btn" />
            </form>
            {error && <p>{error}</p>}
            <br />
            <p>Or</p>
            <br />

            <Link to="/">Login Page</Link>
        </div>
    );
};

export default Signup;
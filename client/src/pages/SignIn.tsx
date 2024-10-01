import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { signInUser, User } from "utils/auth";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "utils/globals";
import { useAlert } from "react-alert";
import logo from "assets/logo.png";
import { CircularProgress, MenuItem } from "@mui/material";
import Layout from "./Layout";

export default function SignIn() {
  const [type, setType] = React.useState("student");
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const alert = useAlert();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const res = await fetch(`${baseUrl}sign-in/`, { method: "POST", body: data });
    if (res.status === 200) {
      const credentials: { token: string; user: User } = await res.json();
      signInUser(credentials.user, credentials.token);
      alert.show("Sign in successful", { type: "success" });
      navigate("/");
    } else {
      try {
        const res_data = await res.json();
        if (typeof res_data === "object") {
          Object.keys(res_data).forEach((key) => {
            alert.error(`${key}: ${res_data[key]}`);
          });
        } else {
          alert.error(res_data);
        }
      } catch (error) {
        alert.error("Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box component="img" src={logo} alt="Brand" width="5rem" sx={{ borderRadius: 2 }} />
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              name="type"
              label="User Type"
              select
              SelectProps={{ sx: { height: "50px", minHeight: "100%" } }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              required
              fullWidth
              label={type === "student" ? "Matriculation Number" : "Username"}
              name="username"
              autoFocus
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, color: "#fff" }}
              disabled={loading} // Disable the button when loading
              startIcon={loading ? <CircularProgress size={20} color="secondary" /> : null}
            >
              Sign In
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/sign-up" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}

const defaultTheme = createTheme({ typography: { fontFamily: "Inter" } });

import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import { signInUser, User } from "utils/auth";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "utils/globals";
import { useAlert } from "react-alert";
import logo from "assets/logo.png";
import Layout from "./Layout";

export default function SignUp() {
  const [type, setType] = React.useState("student");
  const [image, setImage] = React.useState<File | null>(null);
  const [imageDataUri, setImageDataUri] = React.useState<string | ArrayBuffer | null>("");
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const alert = useAlert();

  const handleImageChange = (event) => {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImage(file);
        setImageError(null);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUri = reader.result;
          setImageDataUri(dataUri);
          // Do something with the data URI, such as sending it to a server
        };
        reader.readAsDataURL(file);
      } else {
        setImage(null);
        setImageError("Invalid file type. Please select an image file.");
      }
    } else {
      setImage(null);
      setImageError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const res = await fetch(`${baseUrl}sign-up/`, {
      method: "POST",
      body: data,
    });
    if (res.status === 200 || res.status === 201) {
      const credentials: { token: string; user: User } = await res.json();
      await signInUser(credentials.user, credentials.token);
      alert.show("Sign up successful", { type: "success" });
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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2} sx={{ maxWidth: "444px" }}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="type"
                  label="User Type"
                  select
                  SelectProps={{ sx: { height: "45px", minHeight: "100%" } }}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="first_name"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={type === "student" ? "Matriculation Number" : "Username"}
                  name="username"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ width: "100%" }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">Passport</InputLabel>
                  <Typography sx={{ position: "absolute", p: 2 }} variant="caption">
                    {image?.name}
                  </Typography>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type="file"
                    label="Passport"
                    name="passport"
                    inputProps={{ style: { opacity: 0, zIndex: 1 } }}
                    onChange={handleImageChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <img
                          alt={image?.name}
                          src={imageDataUri as string}
                          style={{ width: 30, aspectRatio: 1, objectFit: "cover" }}
                        />
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="address"
                  label="Address"
                  autoComplete="address"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, color: "#fff" }}
              disabled={loading} // Disable the button when loading
              startIcon={loading ? <CircularProgress size={20} color="secondary" /> : null}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="sign-in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}

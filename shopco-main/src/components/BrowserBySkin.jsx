import React from 'react';
import { Box, Typography, Grid } from "@mui/material";
import img1 from "../assets/img/new1.png";
import img2 from "../assets/img/new2.png";
import img3 from "../assets/img/new3.png";
import img4 from "../assets/img/new4.png";
const skinCategories = [
  { id: 1, label: "Casual", image: img1 },
  { id: 2, label: "Formal", image:img2 },
  { id: 3, label: "Casual", image: img3 },
  { id: 4, label: "Formal", image: img4 }
];

export default function BrowserBySkin() {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        p: { xs: 2, sm: 4 }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          textAlign: "center",
          borderRadius: "20px",
          width: { xs: "100%", sm: "90%", md: "70%" },
          backgroundColor: "#F5F5F5",
          boxShadow: 2,
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            mb: { xs: 2, sm: 4 },
            fontSize: { xs: "1.5rem", sm: "2rem" }
          }}
        >
          BROWSE BY SKIN
        </Typography>
        <Grid 
          container 
          spacing={{ xs: 1, sm: 1}}
          sx={{ 
            alignItems: "center", 
            justifyContent: "center" 
          }}
        >
          {skinCategories.map((category, index) => (
            <Grid 
              key={category.id} 
              item 
              xs={12} 
              sm={6} 
              sx={{ 
                position: "relative", 
                display: "flex", 
                justifyContent: "center" 
              }}
            >
              <Box 
                sx={{ 
                  position: "relative", 
                  width: { xs: "60%", sm: "60%" },
                  mb: { xs: 2, sm: 3 }
                }}
              >
                <img
                  src={category.image}
                  alt={category.label}
                  style={{ 
                    width: "100%", 
                    borderRadius: "10px",
                    aspectRatio: "1",
                    objectFit: "cover"
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: { xs: "0.8rem", sm: "1rem" }
                  }}
                >
                  {category.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
const db = require("./database");
const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads");
    },

    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {

    db.all("SELECT * FROM icons", [], (err, rows) => {

        res.render("index", {
            icons: rows
        });

    });

});

app.post("/upload", upload.single("icon"), (req, res) => {

    const iconName = path.parse(req.file.originalname).name;

    const filePath = "/uploads/" + req.file.filename;

    db.run(
        "INSERT INTO icons(name,file) VALUES(?,?)",
        [iconName, filePath]
    );

    res.redirect("/");
});

app.get("/icons.css", (req, res) => {

    db.all("SELECT * FROM icons", [], (err, icons) => {

        if(err){
            console.log(err);
            return res.send("Database Error");
        }

        console.log(icons);

        let css = "";

        icons.forEach(icon => {

            const className = icon.name.toLowerCase();

            css += `
.di-${className}{
    display:inline-block;
    width:24px;
    height:24px;
    background:url('${icon.file}');
    background-size:contain;
    background-repeat:no-repeat;
    background-position:center;
}
`;

        });

        res.setHeader("Content-Type", "text/css");
        res.send(css);

    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

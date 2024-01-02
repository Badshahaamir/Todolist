const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistdb');

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<-- Hit this to delete item"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    list: [itemSchema]
})

const Customlist = new mongoose.model("Customlist", listSchema);

app.get("/", async (req, res) => {
    const day = "Today";
    const itemfind = await Item.find({});

    if (itemfind.length === 0) {

        await Item.insertMany([item1, item2, item3]);

        res.redirect("/");
    }
    else {
        res.render("home", {
            listTitle: day,
            newaddlist: itemfind
        })
    }
})

app.post("/", async (req, res) => {
    const newlist = req.body.newitem;
    const listName = req.body.list;

    const item = new Item({
        name: newlist
    });

    if (listName == "Today") {

        defaultItems.push(item);
        item.save();
        res.redirect("/");

    } else {
        const customFindList = await Customlist.findOne({ name: listName })
        customFindList.list.push(item);
        customFindList.save();
        res.redirect("/" + listName)
    }

})

app.post("/delete", async (req, res) => {
    const checkitemId = req.body.checkbox;
    const deleteListName=req.body.hiddenInput;

    if(deleteListName=="Today"){

        await Item.findByIdAndDelete(checkitemId)
        
        res.redirect("/");
    }
    else
    {
       const deleteItemFind= await Customlist.findOneAndUpdate({name:deleteListName},{$pull: {list: {_id:checkitemId}}});
       res.redirect("/"+deleteListName);
    }

})

app.get("/aboutus", (req, res) => {
    res.render("about");
})

app.get("/:customListName", async (req, res) => {
    const customName = _.capitalize(req.params.customListName);

    const findlist = await Customlist.findOne({ name: customName }).exec();
    if (!findlist) {
        const list = new Customlist({
            name: customName,
            list: [item1, item2, item3]
        })
        list.save();
        res.redirect("/" + customName)
    } else {
        res.render("home", {
            listTitle: findlist.name,
            newaddlist: findlist.list
        })
    }
});

app.listen(3000, () => console.log("Server is started..."));
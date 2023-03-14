//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.ncpmgmk.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const itemOne = new Item({
  name: "Eat"
});

const itemTwo = new Item({
  name: "Sleep"
});

const itemThree = new Item({
  name: "Code"
});

const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", async function(req, res) {

  const foundItems = await Item.find({});

  if (foundItems.length === 0) {
    Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  };
  
});

app.get("/:customList", async function(req,res){

  const customList = _.capitalize(req.params.customList);

  const foundList = await List.findOne({name: customList}).exec();

  if (foundList === null) {
    const list = new List({
    name: customList,
    items: defaultItems
    });

    list.save();

    res.redirect("/" + customList);

  } else {
    res.render("list", {listTitle: customList, newListItems: foundList.items});

  };

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");

  } else {
    const foundList = await List.findOne({name: listName}).exec();

    if (!null) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }

  };

});

app.post("/delete", async function(req, res) {

  const checkedItemID = req.body.checkbox;

  const listName = req.body.listName;

  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItemID);
    res.redirect("/");

  } else {
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}});
    res.redirect("/" + listName);
  };
   
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// Upload to github
// create environment variables
// Launch on digital ocean
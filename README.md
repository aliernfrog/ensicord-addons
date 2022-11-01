# ensicord-addons-template
Add-on repository template for [Ensicord](https://github.com/aliernfrog/ensicord)

## ℹ️ Information
- Main add-on repository is [here](https://github.com/aliernfrog/ensicord-addons)
- Add-on file template can be found [here](https://github.com/aliernfrog/ensicord-addons-template/blob/main/addon-template.json)
- ⚠️ Ensicord add-ons are still WIP and they can only be used in [compose branch](https://github.com/aliernfrog/ensicord/tree/compose)

## ❓ How do Ensicord add-ons work?
- Ensicord add-ons are used to configure the app appearance and behavior
- Ensicord add-ons are fetched from add-on repositories which is a JSON file including an array of add-ons
- Add-on repositories can be edited in Ensicord

## 📂 To create your own add-on repository
- Use [this](https://github.com/aliernfrog/ensicord-addons-template/generate) template

## 🖇️ To create an add-on
Add-on file template can be found [here](https://github.com/aliernfrog/ensicord-addons-template/blob/main/addon-template.json)
<details>
  <summary>When using GitHub workflow:</summary>
  - Create <code>your-addon.json</code> in <code>addons</code> folder<br>
  - Put the add-on object in the JSON file you just created<br>
  - Push the changes to <code>main</code> branch and wait until changes are live
</details>
<details>
  <summary>When NOT using GitHub workflow:</summary>
  - Create <code>addons.json</code> or use the existing one<br>
  - If there isn't any array in the file, create an empty one<br>
  - Put your add-ons in the array<br>
  - Save the file
</details>
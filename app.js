// GLOBAL SELECTIONS AND VARIABLES

// SELECTING THE FIVE COLOR DIVS
const colorDivs = document.querySelectorAll(".color");

// SELECTING THE GENERATE BUTTON FROM THE GENERATE PANEL
const generateBtn = document.querySelector(".generate");

// SELECTING ALL THE INPUTS IN THE SLIDERS
const sliders = document.querySelectorAll("input[type='range']");

// SELECTING THE H2 HEADING IN THE COLORS DIV
const currentHexes = document.querySelectorAll(".color h2");

// SELECTING THE COPY CONTAINER
const popup = document.querySelector(".copy-container");

// THE SETTING ICON IN THE CONTROLS DIV
const adjustButton = document.querySelectorAll(".adjust");

// THE UNLOCK ICON IN THE CONTROLS DIV
const lockButton = document.querySelectorAll(".lock");

// THE X BUTTON IN THE SLIDERS DIV
const closeAdjustments = document.querySelectorAll(".close-adjustment");

// SELECTING ALL THE SLIDERS
const slidersContainers = document.querySelectorAll(".sliders");

// THIS IS FOR STORING COLORS
let initialColors;

// THIS IS FOR LOCAL STORAGE
let savedPalettes = [];

// EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockColor(index);
  });
});

// FUNCTIONS

// COLOR GENERATOR FUNCTION
function generateHex() {
  // USING THE RANDOM FUNCTION OF CHROMA JS LIBRARY WHICH(Creates a random color by generating a random hexadecimal string.)
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    // GETTING THE H2 IN THE COLOR DIV
    const hexText = div.children[0];
    // console.log(hexText.innerText);

    // GENERATING THE HEX COLOR FROM THE GENERATE HEX FUNCTION
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      // ADDING IT TO ARRAY
      initialColors.push(chroma(randomColor).hex());
      // console.log(hexText.innerText);
    }

    // ADDING GENERATED COLOR TO COLOR DIV BACKGROUND
    div.style.backgroundColor = randomColor;

    // ADDING HEX COLOR NAME TO H2 TAG
    hexText.innerText = randomColor;

    // CHECK FOR CONTRAST
    checkTextContrast(randomColor, hexText);

    // INITIAL COLORIZE SLIDERS BY GRABBING EACH COLOR FROM EVERY DIV
    const color = chroma(randomColor);

    // GETTING ALL THE HUE, BRIGHTNESS AND SATURATION INPUTS IN THE SLIDERS DIV
    const sliders = div.querySelectorAll(".sliders input");

    // DIFFERENTIATING THE THREE INPUTS INDIVIDUALLY
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    // TO COLOR THE SLIDERS
    colorizeSliders(color, hue, brightness, saturation);
  });
  // FUNCTION TO RESET INPUTS
  resetInputs();

  // CHECK FOR BUTTON CONTRAST
  adjustButton.forEach((button, index) => {
    // WITH THE INITIALCOLORS WE GET THE COLOR AND THE BUTTON ON THAT INDEX WILL BE CHECKED FOR CONTRAST
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });

  // THE CONTRAST FOR BOTH THE ABOVE CAN BE CHECKED INDIVIDUALLY ALSO LIKE BELOW

  // adjustButton.forEach((button,index)=>{
  //     // WITH THE INITIALCOLORS WE GET THE COLOR AND THE BUTTON ON THAT INDEX WILL BE CHECKED FOR CONTRAST
  //     checkTextContrast(initialColors[index], button);
  // });

  // lockButton.forEach((button,index)=>{
  //     checkTextContrast(initialColors[index], button);
  // });
}

// FUNCTION TO CHECK THE CONTRAST OF THE COLOR( 0 VALUE IS THE DARKEST AND 1 IS THE LIGHTEST )
function checkTextContrast(color, text) {
  // LUMINANCE FUNCTION USED FROM CHROMA JS LIBRARY TO CHECK THE LUMINACE OF THE COLOR
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

// FUNCTION TO APPLY COLOR AT THE BACK OF INPUT TYPE RANGE
function colorizeSliders(color, hue, brightness, saturation) {
  // SCALE SATURATION

  // WILL SET THE SATURATION TO 0(min)
  // SET FUNCTION USED FROM CHROMA LIBRARY

  const noSat = color.set("hsl.s", 0);

  // WILL SET THE SATURATION TO 1(max)
  const fullSat = color.set("hsl.s", 1);

  // SCALE FUNCTION USED FROM CHROMA JS LIBRARY
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;

  // SCALE BRIGHTNESS

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  // HUE
  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

// FUNCTION THAT WILL FIRES WHEN THE INPUT TYPE RANGE KNOB IS CLICKED
function hslControls(e) {
  // GETTING THE INDEX FROM THE DATA-* PROPERTY USED IN THE INPUT TYPE RANGE
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  // GETTING THE PARTICULAR COLOR DIV SLIDERS
  let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // THE INITIAL COLOR WAS SET IN ARRAY IS USED HERE
  const bgcolor = initialColors[index];
  // console.log(`initialArr:${bgcolor}`);

  let color = chroma(bgcolor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // CALL COLORIZESLIDERS FUNCTION FOR LIVE UPDATE SLIDERS
  colorizeSliders(color, hue, brightness, saturation);
}

// TO UPDATE THE COLOR NAME TO PARTICULAR COLOR DIV
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  // console.log(activeDiv);
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  // CHECK CONTRAST
  checkTextContrast(color, textHex);

  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      // TO ACESS HUE FROM HSL, 0 IS FOR HUE
      const hueValue = chroma(hueColor).hsl()[0];
      // console.log(Math.floor(hueValue));
      slider.value = Math.floor(hueValue);
    }

    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      // TO ACESS BRIGHT(LIGHTNESS) FROM HSL, 2 IS FOR BRIGHTNESS

      const brightValue = chroma(brightColor).hsl()[2];
      // console.log(Math.floor(brightValue*100)/100);

      // THIS FORMULA WILL MODIFY THE BRIGHTNESS VALUE TO TWO DECIMAL DIGITS LIKE 0.42
      slider.value = Math.floor(brightValue * 100) / 100;
    }

    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      // TO ACESS SATURATION FROM HSL, 1 IS FOR SATURATION

      const satValue = chroma(satColor).hsl()[2];
      // console.log(Math.floor(satValue*100)/100);

      // THIS FORMULA WILL MODIFY THE SATURATION VALUE TO TWO DECIMAL DIGITS LIKE 0.42
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

// TO COPY THE HEX COLORS NAMES TO CLIPBOARD
function copyToClipboard(hex) {
  // CREATING AN TEXTAREA
  const el = document.createElement("textarea");

  // INSERTION OF HEX COLOR NAMES IN THE TEXTAREA
  el.value = hex.innerText;

  // APPENDING IT WITH THE BODY
  document.body.appendChild(el);

  // SELECTING THE TEXT IN THE TEXTAREA
  el.select();

  // COPYING THE TEXT AFTER SELECTING IT
  // document.execCommand('copy');
  // ****************************
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => {
      document.body.removeChild(el);

      // POPUP ANIMATION
      const popupBox = popup.children[0];
      popup.classList.add("active");
      popupBox.classList.add("active");
    });
  }
  // ****************************
}

// FUNCTION TO OPEN THE SLIDERS PANEL
function openAdjustmentPanel(index) {
  slidersContainers[index].classList.toggle("active");
}

// FUNCTION TO CLOSE THE SLIDERS PANEL
function closeAdjustmentPanel(index) {
  slidersContainers[index].classList.remove("active");
}

// FUNCTION TO LOCK OR UNLOCK THE COLOR DIV OR ACTIVATE OR DEACTIVATE THE LOCK BUTTON
function lockColor(index) {
  const colorDivs = document.querySelectorAll(".color");
  colorDivs[index].classList.toggle("locked");
  if (colorDivs[index].classList.contains("locked")) {
    lockButton[index].innerHTML = "<i class='fas fa-lock'></i>";
  } else {
    lockButton[index].innerHTML = "<i class='fas fa-lock-open'></i>";
  }
}

// IMPLEMENT SAVE TO PALETTE AND LOCAL STORAGE STUFF
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
// EVENT LISTENERS

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

// THIS FUNCTION WILL OPEN A BOX TO SAVE THE PALETTENAME
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

// THIS FUNCTION WILL CLOSE THE BOX IN WHERE WE HAVE TO SAVE THE PALETTENAME
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

// THIS FUNCTION WILL SAVE THE PALETTE WITH THE GIVEN NAME
function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];

  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  //   GENERATE OBJECT
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  //   IF PROPERTY AND VALUE OF OBJECT IS OF SAME NAME WE CAN WRITE OBJECT LIKE THIS
  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);

  savetoLocal(paletteObj);
  saveInput.value = "";

  //   GENERATE THE PANEL FOR LIBRARY
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");

  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  //   ATTACH EVENT TO THE PALETTE BUTTON
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();

    // WILL GET THE BUTTON NUMBER IN PALETTEINDEX
    const paletteIndex = e.target.classList[1];

    // SET INITIALCOLORS TO NULL SO THAT WE CAN UPDATE THE SELECTED PALETTE
    initialColors = [];

    // PUSHING THE SELECTED PALETTE COLORS TO THE INITIALCOLORS
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);

      // PUSHING THE COLORS AT THE COLOR DIVS BACKGROUND
      colorDivs[index].style.backgroundColor = color;

      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //   APPEND TO LIBRARY
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

//  THIS FUNCTION WILL SAVE PALETTE TO LOCAL STORAGE
function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //   GENERATE THE PANEL FOR LIBRARY
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");

      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      //   ATTACH EVENT TO THE PALETTE BUTTON
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();

        // WILL GET THE BUTTON NUMBER IN PALETTEINDEX
        const paletteIndex = e.target.classList[1];

        // SET INITIALCOLORS TO NULL SO THAT WE CAN UPDATE THE SELECTED PALETTE
        initialColors = [];

        // PUSHING THE SELECTED PALETTE COLORS TO THE INITIALCOLORS
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);

          // PUSHING THE COLORS AT THE COLOR DIVS BACKGROUND
          colorDivs[index].style.backgroundColor = color;

          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //   APPEND TO LIBRARY
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();

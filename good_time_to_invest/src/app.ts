// src/app.ts

let bank_info: Record<string, Record<string, string>> = {
    'fixed_rate':
    {
        'name': 'fixed_rate',
        'text_box_placeholder': "Fixed rate charge (EUR)"
    },
    'variable_rate':
    {
        'name': 'variable_rate',
        'text_box_placeholder': "Variable rate charge (%)"
    },
};

let portfolio_info: Record<string, Record<string, string>> = {

    'yearly_growth':
    {
        'name': 'yearly_growth',
        'text_box_placeholder': 'Expected Yearly Growth (%)'
    },
    'months_to_simulate':
    {
        'name': 'months_to_simulate',
        'text_box_placeholder': 'Number of months to sim'
    }
};


let investor_info: Record<string, Record<string, string>> = {

    'monthly_deposit':
    {
        'name': 'monthly_deposit',
        'text_box_placeholder': 'Deposit per month (EUR)'
    }
};

// Function to read dropdown menu value
function readDropdownValue(): string {
    const dropdown = document.getElementById("bank-dropdown") as HTMLSelectElement;
    return dropdown.value;
}



// Function to be executed when the page loads
window.onload = () => {
    const bank_container = document.getElementById("bank-container");

    for (const key in bank_info) {
        const textBox = document.createElement("input");
        textBox.type = "text";
        textBox.name = bank_info[key]["name"];
        textBox.placeholder = bank_info[key]["text_box_placeholder"];
        textBox.classList.add("textbox"); // Add a class for styling
        bank_container.appendChild(textBox);
    }

    const portfolio_container = document.getElementById("portfolio-container");

    for (const key in portfolio_info) {
        const textBox = document.createElement("input");
        textBox.type = "text";
        textBox.name = portfolio_info[key]["name"];
        textBox.placeholder = portfolio_info[key]["text_box_placeholder"];
        textBox.classList.add("textbox"); // Add a class for styling
        portfolio_container.appendChild(textBox);
    }

    const investor_container = document.getElementById("investor-container");

    for (const key in investor_info) {
        const textBox = document.createElement("input");
        textBox.type = "text";
        textBox.name = investor_info[key]["name"];
        textBox.placeholder = investor_info[key]["text_box_placeholder"];
        textBox.classList.add("textbox"); // Add a class for styling
        investor_container.appendChild(textBox);
    }

    // Fill in Bank Presets

    const dropdownMenu = document.getElementById("bank-dropdown") as HTMLSelectElement;
    dropdownMenu.addEventListener("change", () => {
        fill_in_bank_preset();
    });

    const button = document.createElement("button");
    button.textContent = "Calculate";
    button.addEventListener("click", async () => {
        await calculate_returns();
    });
    const calculateButtonContainer = document.getElementById("calculate-button");
    calculateButtonContainer.appendChild(button); // Append to calculateButtonContainer
};


function fill_in_bank_preset(): boolean {

    const dropdownMenu = document.getElementById("bank-dropdown") as HTMLSelectElement;
    const bankContainer = document.getElementById("bank-container");
    const textBoxes = bankContainer.querySelectorAll(".textbox");

    let fixed_rate_textbox: HTMLInputElement | null = null;
    let variable_rate_textbox: HTMLInputElement | null = null;
    
    // Update the corresponding textbox placeholder
    textBoxes.forEach((textBox: HTMLInputElement) => {
        if (textBox.name === "fixed_rate") {
            fixed_rate_textbox = textBox;
        } else if(textBox.name === "variable_rate") {
            variable_rate_textbox = textBox;
        }
    });

    console.log("123");
    if (dropdownMenu.value === "alta") {
        console.log("1");
        fixed_rate_textbox.value = String(0.3);
        variable_rate_textbox.value = String(0.9);
    } else if (dropdownMenu.value === "intesa") {
        console.log("2");
        fixed_rate_textbox.value = String(1.5);
        variable_rate_textbox.value = String(1.5);
    } else if (dropdownMenu.value === "erste") {
        console.log("3");
        fixed_rate_textbox.value = String(25);
        variable_rate_textbox.value = String(0);
    } else {
        fixed_rate_textbox.value = fixed_rate_textbox.placeholder;
        variable_rate_textbox.value = variable_rate_textbox.placeholder;
    }

    return true;
}


// Function to read text box values and return them as a JSON object
function readTextBoxValues(): Record<string, string> {
    const textBoxes = document.querySelectorAll("input[type='text']");
    const values: Record<string, string> = {};

    textBoxes.forEach((textBox: HTMLInputElement) => {
        const textBoxName = textBox.name; // Use the name attribute as the key
        const textBoxValue = textBox.value;
        values[textBoxName] = textBoxValue;
    });


    console.log(values);

    return values;
}

async function sendJSONToFlask(data: Record<string, string>): Promise<Record<string, string>> {
    const url = "/";
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const result = await response.json();
        console.log("Response from Flask:", result);
        return result;
    } else {
        console.error("Error sending JSON data to Flask");
    }

}

async function calculate_returns(): Promise<Record<string, string>> {
    const text_box_values = readTextBoxValues();
    const calculation_results = await sendJSONToFlask(text_box_values);
    return text_box_values;
}

// Function to populate the dropdown
function populateDropdown(dropdownOptions): void {
    const dropdown = document.getElementById('dynamic-dropdown') as HTMLSelectElement;

    // Clear existing options
    dropdown.innerHTML = '';

    // Create and append new options
    dropdownOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.text = option.label;
        optionElement.value = option.value;
        dropdown.appendChild(optionElement);
    });
}

// Fetch the text file and parse its content
async function fetchAndParseFile(url: string): Promise<any> {
    const response = await fetch(url);
    if (response.ok) {
        const text = await response.text();
        return JSON.parse(text);
    } else {
        throw new Error('Error fetching the file');
    }
}
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

// Define a global array to store bank data
interface bankData {
    bank_name: string,
    bank_pretty_name: string,
    variable_rate: number,
    fixed_rate: number
}

const banksData: Array<bankData> = [];


// Function to populate the dropdown
function populateDropdown(banks_info): void {
    const dropdown = document.getElementById('bank-dropdown') as HTMLSelectElement;

    // Clear existing options
    dropdown.innerHTML = '';

    const empty_element = document.createElement('option');
    empty_element.text = "Choose Bank";
    empty_element.value = "empty";
    dropdown.appendChild(empty_element);

    for (const bankKey of Object.keys(banks_info)) {
        const bank_name = bankKey;
        const bank_pretty_name = banks_info[bank_name]["name"];
        const variable_rate = banks_info[bank_name]["variable"];
        const fixed_rate = banks_info[bank_name]["fixed"];

        banksData.push(
            {
                bank_name,
                bank_pretty_name,
                variable_rate,
                fixed_rate
            }
        );

        // Create and append new options
        const optionElement = document.createElement('option');
        optionElement.text = bank_pretty_name;
        optionElement.value = bank_name;
        dropdown.appendChild(optionElement);
    }
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


// Function to read dropdown menu value
function readDropdownValue(): string {
    const dropdown = document.getElementById("bank-dropdown") as HTMLSelectElement;
    return dropdown.value;
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

    return values;
}


function fill_in_bank_preset(): boolean {

    const bankContainer = document.getElementById("bank-container");
    const textBoxes = bankContainer.querySelectorAll(".textbox");


    let fixed_rate_textbox: HTMLInputElement | null = null;
    let variable_rate_textbox: HTMLInputElement | null = null;

    // Update the corresponding textbox placeholder
    textBoxes.forEach((textBox: HTMLInputElement) => {
        if (textBox.name === "fixed_rate") {
            fixed_rate_textbox = textBox;
        } else if (textBox.name === "variable_rate") {
            variable_rate_textbox = textBox;
        }
    });

    const dropdown = document.getElementById('bank-dropdown') as HTMLSelectElement;

    fixed_rate_textbox.value = fixed_rate_textbox.placeholder;
    variable_rate_textbox.value = variable_rate_textbox.placeholder;
    for (const bank of banksData) {
        if (bank.bank_name == dropdown.value) {
            fixed_rate_textbox.value = String(bank.fixed_rate)
            variable_rate_textbox.value = String(bank.variable_rate)
        }
    }

    return true;
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

    // Fill in Bank presets
    let url: string = "/banks";
    fetchAndParseFile(url)
        .then(data => {
            populateDropdown(data);
        })
        .catch(error => {
            console.error(error);
        });

    const dropdownMenu = document.getElementById("bank-dropdown") as HTMLSelectElement;
    dropdownMenu.addEventListener("change", (event) => {
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

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

let deposit_per_month: number = 0;

// Function to be executed when the page loads
window.onload = () => {
    const textField = document.getElementById("text-field-1") as HTMLTextAreaElement;
    textField.value = "";

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
        const textField = document.getElementById("text-field-1") as HTMLTextAreaElement;
        textField.value = "";

        // Select the SVG element
        const svg = d3.select("#bar-chart");

        // Remove all elements within the SVG
        svg.selectAll("*").remove();


        let returns = await calculate_returns();
        draw_result_graph(returns);
        write_result_findings(returns);
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
        // console.log("Response from Flask:", result);
        return result;
    } else {
        console.error("Error sending JSON data to Flask");
    }

}


async function calculate_returns(): Promise<Record<string, string>> {
    const text_box_values = readTextBoxValues();

    deposit_per_month = Number(text_box_values['monthly_deposit']);
    console.log(`deposit_per_month = ${deposit_per_month}`);

    const calculation_results = await sendJSONToFlask(text_box_values);
    return calculation_results;
}

function write_result_findings(calculated_returns: any) {
    // Get a reference to the text area element
    const textField = document.getElementById("text-field-1") as HTMLTextAreaElement;

    // Check if the text area element exists
    if (textField) {
        const objs = calculated_returns;
        // Warning: this destroys the original ordering, making this array useless after this printout!
        objs.sort((a, b) => (a.total_money_out < b.total_money_out) ? 1 : ((b.total_money_out < a.total_money_out) ? -1 : 0))

        const result_text = `With these parameters, you'd earn the most money if investing ${deposit_per_month * Number(objs[0].deposit_on_x_th_month)} every ${objs[0].deposit_on_x_th_month} month(s).`;

        // Set the text content of the text area
        textField.value = result_text;
    } else {
        console.error("Text area element not found.");
    }
}


function draw_result_graph(calculated_returns: any) {

    let data = [];

    for (const val of calculated_returns) {
        data.push({ name: Number(val['deposit_on_x_th_month']), value: Number(val['total_money_out']) });
    }

    var margin = {
        top: 10,
        right: 10,
        bottom: 50,
        left: 50
    };

    // const parentElement = document.getElementById("bar-chart").parentElement;
    const container = document.getElementById("chart-container");

    const height = container.clientHeight - margin.top - margin.bottom;
    const width = 500 - margin.left - margin.right;

    // Create an SVG element
    const svg = d3.select("#bar-chart")
        .attr("width", "100%")  // Set width to 100%
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // Define scales
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.name.toString()))
        .range([0, height])
        .padding(0.1); // Adjust the padding value as needed, e.g., padding(0.05


    const has_negative_values: boolean = (d3.min(data, d => d.value) < 0) ? true : false;

    let x_domain = has_negative_values ? [d3.min(data, d => d.value), d3.max(data, d => d.value)] :
        [0, d3.max(data, d => d.value)];

    const xScale = d3
        .scaleLinear()
        .domain(x_domain) // Set the x-axis domain to start from 0
        .range([0, width]); // Set the x-axis range


    // Calculate the maximum width of a bar
    const maxBarWidth = yScale.bandwidth();

    // Calculate the maximum font size to fit within the bar
    const maxFontSize = maxBarWidth / 2;
    const formatNumber = d3.format(".2f");

    // Create bars
    svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => yScale(d.name.toString()))
        .attr("height", 20) // Set a fixed height for all bars (adjust as needed)
        .attr("x", 0) // X position starts from 0
        .attr("width", (d) => xScale(d.value));

    // Add labels displaying values at the top of each column
    svg
        .selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d) => xScale(d.value) + 5) // Adjust the position
        .attr("y", (d) => yScale(d.name.toString()) + 10) // Adjust the vertical position
        .attr("text-anchor", "start") // Adjust the text anchor
        .style("font-size", "12px") // Set a fixed font size (adjust as needed)
        .text((d) => formatNumber(d.value));


    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));


    // Optionally, add labels and titles
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "bottom")
        .text("Total Money Out");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Deposit on x-th Month");
}

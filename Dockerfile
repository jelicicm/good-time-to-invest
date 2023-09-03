# Use an official Python runtime as a parent image
FROM python:3.9

# Set the working directory to /good-time-to-invest
WORKDIR /good-time-to-invest

# Copy the current directory contents into the container at /good-time-to-invest
COPY . /good-time-to-invest

# Install Node.js and npm
RUN apt-get update && apt-get install -y ca-certificates curl gnupg
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

RUN npm install typescript
RUN cd good_time_to_invest && npm run build && cd -

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt
RUN pip install -e .

# Make port 5000 available to the world outside this container
EXPOSE 5000
EXPOSE 80

# Define environment variable
ENV NAME World

# Define environment variable to suppress interactive prompts during npm install
ENV DEBIAN_FRONTEND noninteractive

WORKDIR good_time_to_invest
# Run app.py when the container launches
CMD ["python", "flask_app.py"]


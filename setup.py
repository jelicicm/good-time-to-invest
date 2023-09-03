from setuptools import setup, find_packages

setup(
    name="good_time_to_invest",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "Flask",
    ],
    package_dir={'good_time_to_invest':'good_time_to_invest'}, # the one line where all the magic happens
   package_data={
      'data': ['data/*']
   },

    entry_points={
        "console_scripts": [
            "good_time_to_invest = good_time_to_invest.flask_app:run_server",
        ],
    },
)

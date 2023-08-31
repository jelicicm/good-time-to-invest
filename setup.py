from setuptools import setup, find_packages

setup(
    name="good_time_to_invest",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "Flask",
    ],
    entry_points={
        "console_scripts": [
            "good_time_to_invest = good_time_to_invest.flask_app:main",
        ],
    },
)

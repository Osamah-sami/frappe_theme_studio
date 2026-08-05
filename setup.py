from setuptools import setup, find_packages

setup(
    name='frappe_theme_studio',
    version='1.0.0',
    description='Visual Theme Studio for Frappe/ERPNext',
    author='Your Name',
    author_email='your@email.com',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=["frappe"]
)

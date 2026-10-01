#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const Conf = require('conf');
const axios = require('axios');
const ora = require('ora');

const program = new Command();
const config = new Conf({ projectName: 'autopayx' });

const API_BASE = 'https://api.autopayx.in/v1';

program
  .name('autopayx')
  .description('AutoPayX Official CLI - Manage UPI payments from your terminal')
  .version('1.0.0');

// Login Command
program
  .command('login')
  .description('Authenticate the CLI with your AutoPayX API Key')
  .argument('<apiKey>', 'Your Live or Test API Key (aupi_live_...)')
  .action((apiKey) => {
    config.set('apiKey', apiKey);
    console.log(chalk.green('✔ Successfully authenticated with AutoPayX!'));
    console.log(chalk.gray(`Key saved to local config.`));
  });

// Logout Command
program
  .command('logout')
  .description('Remove your stored API Key')
  .action(() => {
    config.delete('apiKey');
    console.log(chalk.yellow('Logged out successfully. API Key removed.'));
  });

// Orders Group
const orders = program.command('orders').description('Manage UPI Payment Orders');

orders
  .command('create')
  .description('Create a new payment order')
  .requiredOption('-a, --amount <number>', 'Amount in INR')
  .option('-c, --customer <string>', 'Customer name')
  .action(async (options) => {
    const apiKey = config.get('apiKey');
    if (!apiKey) {
      console.log(chalk.red('Error: Not authenticated. Run `autopayx login <apiKey>` first.'));
      return;
    }

    const spinner = ora('Creating order...').start();
    
    try {
      const response = await axios.post(
        `${API_BASE}/create-order`,
        {
          amount: parseFloat(options.amount),
          customer_name: options.customer || 'CLI Customer'
        },
        {
          headers: { 'X-API-Key': apiKey }
        }
      );
      
      spinner.succeed('Order created successfully!');
      console.log('\n' + chalk.bold.blue('Order Details:'));
      console.log(chalk.gray('Order ID: ') + response.data.order_id);
      console.log(chalk.gray('Amount:   ') + `₹${response.data.amount}`);
      console.log(chalk.gray('Pay URL:  ') + chalk.underline.cyan(response.data.payment_url));
      
    } catch (error) {
      spinner.fail('Failed to create order');
      console.log(chalk.red(error.response?.data?.error || error.message));
    }
  });

orders
  .command('status <orderId>')
  .description('Check the status of a specific order')
  .action(async (orderId) => {
    const apiKey = config.get('apiKey');
    if (!apiKey) {
      console.log(chalk.red('Error: Not authenticated. Run `autopayx login <apiKey>` first.'));
      return;
    }

    const spinner = ora('Fetching order status...').start();
    
    try {
      const response = await axios.get(`${API_BASE}/order-status?order_id=${orderId}`, {
        headers: { 'X-API-Key': apiKey }
      });
      
      const { status, payable_amount, customer_name } = response.data.order;
      
      spinner.succeed('Status fetched');
      console.log('\n' + chalk.bold('Status: ') + (status === 'paid' ? chalk.green('PAID ✔') : chalk.yellow(status.toUpperCase())));
      console.log(chalk.gray('Amount: ') + `₹${payable_amount}`);
      console.log(chalk.gray('Name:   ') + customer_name);
      
    } catch (error) {
      spinner.fail('Failed to fetch status');
      console.log(chalk.red(error.response?.data?.error || error.message));
    }
  });

program.parse(process.argv);

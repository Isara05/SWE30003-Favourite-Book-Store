"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";

const { Title, Text } = Typography;

type Customer = {
  customerId: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  accountBalance: number;
  outstandingBalance?: number;
};

type CustomerFormValues = {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  newBalance: number;
};

type CreateCustomerValues = {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
};

const phoneRule = { pattern: /^[+]?[-()\d\s.]+$/, message: 'Enter a valid phone number' };

// Renders the money section.
function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// Renders the manager customers panel section.
export default function ManagerCustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CustomerFormValues>();
  const [createForm] = Form.useForm<CreateCustomerValues>();

  const outstandingCount = useMemo(() => customers.filter((customer) => (customer.outstandingBalance ?? 0) > 0).length, [customers]);

  // Renders the load customers section.
  async function loadCustomers() {
    setLoading(true);
    setError(null);
    try {
      const [allCustomers, outstandingCustomers] = await Promise.all([
        apiGet<Customer[]>("/customers"),
        apiGet<Customer[]>("/customers/outstanding"),
      ]);
      const outstandingMap = new Map(outstandingCustomers.map((customer) => [customer.customerId, customer.outstandingBalance ?? 0]));
      setCustomers(allCustomers.map((customer) => ({ ...customer, outstandingBalance: outstandingMap.get(customer.customerId) ?? 0 })));
    } catch {
      setError("Unable to load customer accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // Renders the open editor section.
  async function openEditor(customer: Customer) {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      newBalance: customer.accountBalance,
    });
  }

  // Renders the handle save section.
  async function handleSave(values: CustomerFormValues) {
    if (!editingCustomer) return;
    setSubmitting(true);
    try {
      await apiPut(`/customers/${editingCustomer.customerId}`, {
        name: values.name,
        address: values.address,
        email: values.email,
        phoneNumber: values.phoneNumber,
      });
      await apiPatch(`/customers/${editingCustomer.customerId}/balance`, {
        newBalance: values.newBalance,
      });
      message.success(`Updated ${values.name}.`);
      setEditingCustomer(null);
      await loadCustomers();
    } catch {
      message.error("Could not update the customer.");
    } finally {
      setSubmitting(false);
    }
  }

  // Renders the handle create customer section.
  async function handleCreateCustomer(values: CreateCustomerValues) {
    setSubmitting(true);
    try {
      await apiPost('/customers', values);
      message.success(`Created ${values.name}.`);
      setCreatingCustomer(false);
      createForm.resetFields();
      await loadCustomers();
    } catch {
      message.error('Could not create the customer.');
    } finally {
      setSubmitting(false);
    }
  }

  // Renders the handle delete section.
  async function handleDelete(customer: Customer) {
    try {
      await apiDelete(`/customers/${customer.customerId}`);
      message.success(`Deleted ${customer.name}.`);
      await loadCustomers();
    } catch {
      message.error("Could not delete the customer. Historical orders may block removal.");
    }
  }

  return (
    <>
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <div>
            <Tag color="cyan" style={{ borderRadius: 999, marginBottom: 8 }}>Customer ledger</Tag>
            <Title level={4} style={{ margin: 0 }}>Customer accounts</Title>
            <Text type="secondary">Review customer profiles, balances, and delete only when the backend allows it.</Text>
          </div>
          <Space>
            <Tag color="orange">{outstandingCount} outstanding</Tag>
            <Button onClick={() => setCreatingCustomer(true)}>Create customer</Button>
            <Button icon={<ReloadOutlined />} onClick={loadCustomers} loading={loading}>Refresh</Button>
          </Space>
        </div>

        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

        <Table
          rowKey="customerId"
          loading={loading}
          size="small"
          pagination={{ pageSize: 8 }}
          dataSource={customers}
          locale={{ emptyText: "No customer records found." }}
          columns={[
            { title: "ID", dataIndex: "customerId", width: 180 },
            { title: "Name", dataIndex: "name", width: 180 },
            { title: "Email", dataIndex: "email", width: 220 },
            { title: "Phone", dataIndex: "phoneNumber", width: 140 },
            {
              title: "Account Balance",
              dataIndex: "accountBalance",
              width: 130,
              render: (value: number) => money(value),
            },
            {
              title: "Outstanding",
              dataIndex: "outstandingBalance",
              width: 130,
              render: (value: number) => (value > 0 ? <Tag color="red">{money(value)}</Tag> : <Tag color="green">Clear</Tag>),
            },
            {
              title: "Actions",
              key: "actions",
              width: 180,
              render: (_: unknown, record: Customer) => (
                <Space>
                  <Button size="small" onClick={() => openEditor(record)}>Edit</Button>
                  <Popconfirm
                    title="Delete this customer?"
                    description="Deletion is blocked when the customer has historical order records."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(record)}
                  >
                    <Button danger size="small">Delete</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Create customer"
        open={creatingCustomer}
        onCancel={() => setCreatingCustomer(false)}
        onOk={() => createForm.submit()}
        okText="Create customer"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form<CreateCustomerValues> layout="vertical" form={createForm} onFinish={handleCreateCustomer}>
          <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, min: 2, message: 'Name must be at least 2 characters' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, whitespace: true, min: 5, message: 'Address must be at least 5 characters' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone number" rules={[{ required: true, whitespace: true }, phoneRule]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCustomer ? `Edit ${editingCustomer.name}` : "Edit customer"}
        open={Boolean(editingCustomer)}
        onCancel={() => setEditingCustomer(null)}
        onOk={() => form.submit()}
        okText="Save changes"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form<CustomerFormValues> layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, min: 2, message: 'Name must be at least 2 characters' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, whitespace: true, min: 5, message: 'Address must be at least 5 characters' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone number" rules={[{ required: true, whitespace: true }, phoneRule]}>
            <Input />
          </Form.Item>
          <Form.Item name="newBalance" label="Account balance" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

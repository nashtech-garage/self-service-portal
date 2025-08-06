import { Button } from "primereact/button";
import React from "react";
import TableTemplate from "./TableTemplate";

const Template: React.FC = () => (
  <div className="p-4">
    <h2 className="text-primary font-bold mb-4">Default</h2>
    <span>Button with className="primary", set size="small", option: outlined, text</span>
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Button className="primary" size="small" label="Sample" />
        <Button className="primary" size="small" label="Sample" outlined />
        <Button className="primary" size="small" label="Sample" text />
      </div>
    </div>

    <span className="mt-4 block">
      For secondary button, use severity="secondary", set size="small", option: outlined, text
    </span>
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Button severity="secondary" size="small" label="Sample" />
        <Button severity="secondary" size="small" label="Sample" outlined />
        <Button severity="secondary" size="small" label="Sample" text />
      </div>
    </div>

    <div className="mt-8">
      <TableTemplate />
    </div>
  </div>
);

export default Template;

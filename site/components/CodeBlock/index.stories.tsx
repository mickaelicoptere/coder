import { Story } from "@storybook/react"
import React from "react"
import { CodeBlock, CodeBlockProps } from "./index"

const sampleLines = `Successfully assigned coder/image-jcws7 to cluster-1
Container image "gcr.io/coder-dogfood/master/coder-dev-ubuntu@sha256" already present on machine
Created container user
Started container user
Using user 'coder' with shell '/bin/bash'`.split("\n")

export default {
  title: "CodeBlock",
  component: CodeBlock,
  argTypes: {
    lines: { control: "object", defaultValue: sampleLines },
  },
}

const Template: Story<CodeBlockProps> = (args: CodeBlockProps) => <CodeBlock {...args} />

export const Example = Template.bind({})
Example.args = {
  lines: sampleLines,
}

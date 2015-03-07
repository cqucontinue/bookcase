#!/usr/bin/env python

import base64
import uuid

def generate():
    return base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)


def main():
    print generate()


if __name__ == "__main__":
    main()
